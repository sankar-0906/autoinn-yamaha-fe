import React, { useState } from 'react';
import {
    Modal, Upload, Button, message, Form, Input, Row, Col, Table, Typography, DatePicker
} from 'antd';
import { InboxOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { processInwardPdf, createVehicleStockInward, updateVehicleStockInward } from '../../../api/vehicleStockInward';
import dayjs from 'dayjs';
import styles from '../VehicleStockInward.module.css';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface InwardImportModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode?: 'import' | 'view' | 'edit';
    initialData?: any;
}

const InwardImportModal: React.FC<InwardImportModalProps> = ({ open, onClose, onSuccess, mode = 'import', initialData }) => {
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [form] = Form.useForm();

    const isViewOnly = mode === 'view';
    const isEditMode = mode === 'edit';

    React.useEffect(() => {
        if (open) {
            if (initialData) {
                setExtractedData({ "VEHICLES": initialData.items || [] });
                form.setFieldsValue({
                    ...initialData,
                    date: initialData.date ? dayjs(initialData.date) : null,
                    daDate: initialData.daDate ? dayjs(initialData.daDate) : null,
                });
            } else {
                setExtractedData(null);
                form.resetFields();
            }
        }
    }, [open, initialData, form]);

    const handleFileUpload = async (file: File) => {
        setLoading(true);
        setProcessingStep('AI Vision Analysis started...');
        try {
            setProcessingStep('Rendering Document Image...');
            const res = await processInwardPdf(file);
            setProcessingStep('AI Extraction with Claude...');

            if (res.data.success) {
                const data = res.data.data;
                console.log("Extracted Data:", data);
                setExtractedData(data);

                // Helper to parse dates like "31-Jan-2026"
                const parseDate = (d: string) => {
                    if (!d) return null;
                    const parsed = dayjs(d, 'DD-MMM-YYYY');
                    return parsed.isValid() ? parsed : dayjs(d);
                };

                form.setFieldsValue({
                    dealerName: data["NAME"],
                    address: data["ADDRESS"],
                    deliveryAddress: data["ADDRESS OF DELIVERY"],
                    invoiceNo: data["INVOICE NO"],
                    date: parseDate(data["DATE"]),
                    placeOfSupply: data["PLACE OF SUPPLY"],
                    daNumber: data["DA NUMBER"],
                    daDate: parseDate(data["DA DATE"]),
                    modeOfTransport: data["MODE OF DISPATCH"],
                    transporter: data["TRANSPORTER"],
                    policyNumber: data["POLICY NO"],
                    vehicleNo: data["VEHICLE NO"],
                    from: data["FROM"],
                    to: data["TO"],
                    insuranceCo: data["INSURANCE CO"]
                });
                message.success('AI Vision Extraction successful! Please verify the data.');
            }
        } catch (err: any) {
            console.error('Frontend PDF Error:', err);
            message.error(err.response?.data?.message || 'AI Extraction failed. Please check your API key.');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
        return false; // Prevent auto-upload
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            setProcessingStep(isEditMode ? 'Updating Record...' : 'Saving to Database...');

            const payload = {
                ...values,
                date: values.date?.toISOString(),
                daDate: values.daDate?.toISOString(),
                vehicles: extractedData["VEHICLES"]
            };

            const res = isEditMode
                ? await updateVehicleStockInward(initialData.id, payload)
                : await createVehicleStockInward(payload);

            if (res.data.success) {
                message.success(isEditMode ? 'Inward record updated successfully' : 'Inward record saved successfully');
                onSuccess();
                setExtractedData(null);
                form.resetFields();
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const vehicleColumns = [
        { title: 'Model Code', dataIndex: 'modelCode', key: 'modelCode' },
        { title: 'Qty', dataIndex: 'qty', key: 'qty' },
        { title: 'Chassis No', dataIndex: 'chassisNo', key: 'chassisNo' },
        { title: 'Engine No', dataIndex: 'engineNo', key: 'engineNo' },
        { title: 'Color', dataIndex: 'colorCode', key: 'colorCode' },
    ];

    const getModalTitle = () => {
        if (isViewOnly) return "View Inward Record";
        if (isEditMode) return "Edit Inward Record";
        return "Import Inward Record";
    };

    return (
        <Modal
            title={getModalTitle()}
            open={open}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onClose}>{isViewOnly ? 'Close' : 'Cancel'}</Button>,
                !isViewOnly && extractedData && (
                    <Button
                        key="save"
                        type="primary"
                        icon={isEditMode ? <EditOutlined /> : <SaveOutlined />}
                        loading={loading}
                        onClick={handleSave}
                        style={{ backgroundColor: '#1a8a7a', borderColor: '#1a8a7a' }}
                    >
                        {isEditMode ? 'Update Record' : 'Save Record'}
                    </Button>
                )
            ]}
        >
            {loading && (
                <div className={styles.processingContainer}>
                    <div className={styles.processingLoader}></div>
                    <Text strong style={{ color: '#1a8a7a', marginTop: 15 }}>{processingStep}</Text>
                    <Text type="secondary">This may take a few seconds depending on PDF size</Text>
                </div>
            )}

            {!extractedData ? (
                <div style={{ padding: '20px 0' }}>
                    <Dragger
                        beforeUpload={handleFileUpload}
                        showUploadList={false}
                        accept=".pdf"
                        disabled={loading}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: '#1a8a7a' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag PDF to this area to upload</p>
                        <p className="ant-upload-hint">
                            Upload the Yamaha Dispatch Advice PDF to automatically extract vehicle details from Page 2.
                        </p>
                    </Dragger>
                </div>
            ) : (
                <Form form={form} layout="vertical" disabled={isViewOnly}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dealerName" label="Dealer Name"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="invoiceNo" label="Invoice No"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="address" label="Billing Address"><Input.TextArea rows={2} /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="deliveryAddress" label="Delivery Address"><Input.TextArea rows={2} /></Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="placeOfSupply" label="Place of Supply"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="daNumber" label="DA Number"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="daDate" label="DA Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="modeOfTransport" label="Mode of Transport"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="transporter" label="Transporter"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="vehicleNo" label="Truck No"><Input /></Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="from" label="Dispatch From"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="to" label="Dispatch To"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="insuranceCo" label="Insurance Company"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="policyNumber" label="Policy Number"><Input /></Form.Item>
                        </Col>
                    </Row>

                    <Title level={5}>Vehicles List</Title>
                    <Table
                        dataSource={extractedData["VEHICLES"]}
                        columns={vehicleColumns}
                        pagination={false}
                        size="small"
                        rowKey={(record: any, index?: number) => `${record.chassisNo}-${index}`}
                    />
                </Form>
            )}
        </Modal>
    );
};

export default InwardImportModal;
