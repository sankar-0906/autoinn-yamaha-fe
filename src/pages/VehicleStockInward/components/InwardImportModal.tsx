import React, { useState } from 'react';
import {
    Modal, Upload, Button, message, Form, Input, Row, Col, Table, Space, Typography, DatePicker
} from 'antd';
import { InboxOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { processInwardPdf, createVehicleStockInward } from '../../../api/vehicleStockInward';
import dayjs from 'dayjs';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface InwardImportModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const InwardImportModal: React.FC<InwardImportModalProps> = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [form] = Form.useForm();

    const handleFileUpload = async (file: File) => {
        setLoading(true);
        try {
            const res = await processInwardPdf(file);
            if (res.data.success) {
                const data = res.data.data;
                setExtractedData(data);
                form.setFieldsValue({
                    dealerName: data.dealerName,
                    address: data.address,
                    invoiceNo: data.invoiceNo,
                    date: data.date ? dayjs(data.date) : null,
                    placeOfSupply: data.placeOfSupply,
                    daNumber: data.daNumber,
                    daDate: data.daDate ? dayjs(data.daDate) : null,
                    modeOfTransport: data.modeOfTransport,
                    transporter: data.transporter,
                    policyNumber: data.policyNumber,
                    vehicleNo: data.vehicleNo,
                    from: data.from,
                    to: data.to,
                    insuranceCo: data.insuranceCo
                });
                message.success('PDF processed successfully! Please verify the data.');
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Failed to process PDF');
        } finally {
            setLoading(false);
        }
        return false; // Prevent auto-upload
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await createVehicleStockInward({
                ...values,
                date: values.date?.toISOString(),
                daDate: values.daDate?.toISOString(),
                vehicles: extractedData.vehicles
            });
            if (res.data.success) {
                message.success('Inward record saved successfully');
                onSuccess();
                setExtractedData(null);
                form.resetFields();
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    const vehicleColumns = [
        { title: 'Model Code', dataIndex: 'modelCode', key: 'modelCode' },
        { title: 'Qty', dataIndex: 'qty', key: 'qty' },
        { title: 'Chassis No', dataIndex: 'chassisNo', key: 'chassisNo' },
        { title: 'Engine No', dataIndex: 'engineNo', key: 'engineNo' },
        { title: 'Color', dataIndex: 'colorCode', key: 'colorCode' },
    ];

    return (
        <Modal
            title="Import Inward Record"
            open={open}
            onCancel={() => {
                setExtractedData(null);
                form.resetFields();
                onClose();
            }}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                extractedData && (
                    <Button
                        key="save"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={loading}
                        onClick={handleSave}
                        style={{ backgroundColor: '#1a8a7a', borderColor: '#1a8a7a' }}
                    >
                        Save Record
                    </Button>
                )
            ]}
        >
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
                            Upload the Yamaha Dispatch Advice PDF to automatically extract vehicle details.
                        </p>
                    </Dragger>
                </div>
            ) : (
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dealerName" label="Dealer Name"><Input /></Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="address" label="Address"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="invoiceNo" label="Invoice No"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} /></Form.Item>
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
                            <Form.Item name="policyNumber" label="Policy Number"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="vehicleNo" label="Vehicle No"><Input /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="insuranceCo" label="Insurance Company"><Input /></Form.Item>
                        </Col>
                    </Row>

                    <Title level={5}>Vehicles List</Title>
                    <Table
                        dataSource={extractedData.vehicles}
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
