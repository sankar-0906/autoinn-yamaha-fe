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
    const [editingCell, setEditingCell] = useState<{
        rowIndex: number;
        dataIndex: string;
    } | null>(null);
    const [form] = Form.useForm();

    const isViewOnly = mode === 'view';
    const isEditMode = mode === 'edit';

    React.useEffect(() => {
        const processInitialData = async () => {
            if (open && initialData) {
                // DEBUG: Log the complete initialData structure
                console.log('=== DEBUG: View/Edit Mode Initial Data ===');
                console.log('Mode:', mode);
                console.log('Complete initialData:', initialData);
                console.log('initialData.items:', initialData.items);
                console.log('initialData.VEHICLES:', initialData.VEHICLES);
                console.log('initialData.lineItems:', initialData.lineItems);
                
                // Check for both legacy items and new VEHICLES array
                let vehiclesData = [];
                if (initialData.VEHICLES && Array.isArray(initialData.VEHICLES) && initialData.VEHICLES.length > 0) {
                    vehiclesData = initialData.VEHICLES;
                    console.log('Using VEHICLES array (new hierarchical format)');
                } else if (initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
                    // Transform legacy items with dynamic data recovery from API
                    console.log('Using items array (legacy format) - calling recovery API...');
                    
                    // Call the dynamic recovery API
                    try {
                        const recoveryResponse = await fetch('/api/vehicle-stock-inward/recover-data', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                vehicles: initialData.items
                            })
                        });
                        
                        if (recoveryResponse.ok) {
                            const recoveryResult = await recoveryResponse.json();
                            if (recoveryResult.success) {
                                vehiclesData = recoveryResult.data;
                                console.log('Dynamic recovery successful:', recoveryResult.data);
                            } else {
                                console.error('Dynamic recovery failed:', recoveryResult.message);
                                // Fallback to basic transformation
                                vehiclesData = initialData.items.map((item: any) => ({
                                    ...item,
                                    modelCode: item.vehicleMaster?.modelCode || 'UNKNOWN',
                                    qty: 1,
                                    colorCode: item.image?.code || 'UNKNOWN'
                                }));
                            }
                        } else {
                            console.error('Recovery API error:', recoveryResponse.statusText);
                            // Fallback to basic transformation
                            vehiclesData = initialData.items.map((item: any) => ({
                                ...item,
                                modelCode: item.vehicleMaster?.modelCode || 'UNKNOWN',
                                qty: 1,
                                colorCode: item.image?.code || 'UNKNOWN'
                            }));
                        }
                    } catch (error) {
                        console.error('Error calling recovery API:', error);
                        // Fallback to basic transformation
                        vehiclesData = initialData.items.map((item: any) => ({
                            ...item,
                            modelCode: item.vehicleMaster?.modelCode || 'UNKNOWN',
                            qty: 1,
                            colorCode: item.image?.code || 'UNKNOWN'
                        }));
                    }
                    
                    console.log('Using items array (legacy format) - transformed with dynamic recovery');
                } else {
                    console.log('No vehicle data found!');
                }
                
                // Group vehicles by model code to calculate proper quantities (works for both formats)
                const groupedVehicles = vehiclesData.reduce((groups: any, vehicle: any) => {
                    const modelCode = vehicle.modelCode;
                    if (!groups[modelCode]) {
                        groups[modelCode] = {
                            modelCode,
                            qty: 0,
                            vehicles: []
                        };
                    }
                    groups[modelCode].qty += 1;
                    groups[modelCode].vehicles.push(vehicle);
                    return groups;
                }, {});
                
                // Convert back to flat array with correct quantities
                const finalVehiclesData = Object.values(groupedVehicles).flatMap((group: any) => 
                    group.vehicles.map((vehicle: any) => ({
                        ...vehicle,
                        qty: group.qty // Set the same quantity for all vehicles in the group
                    }))
                );
                
                console.log('=== DEBUG: Quantity Grouping ===');
                Object.values(groupedVehicles).forEach((group: any) => {
                    console.log(`Model ${group.modelCode}: ${group.qty} vehicles`);
                });
                console.log('=== END GROUPING DEBUG ===');
                
                console.log('Final vehiclesData:', finalVehiclesData);
                console.log('=== DEBUG: Vehicle Data Details ===');
                finalVehiclesData.forEach((vehicle: any, index: number) => {
                    console.log(`Vehicle ${index + 1}:`);
                    console.log(`  ID: ${vehicle.id}`);
                    console.log(`  Model Code: ${vehicle.modelCode || 'MISSING'}`);
                    console.log(`  Qty: ${vehicle.qty || 'MISSING'}`);
                    console.log(`  Chassis No: ${vehicle.chassisNo || 'MISSING'}`);
                    console.log(`  Engine No: ${vehicle.engineNo || 'MISSING'}`);
                    console.log(`  Color: ${vehicle.colorCode || 'MISSING'}`);
                    console.log(`  vehicleMasterId: ${vehicle.vehicleMasterId || 'NULL'}`);
                    console.log(`  imageId: ${vehicle.imageId || 'NULL'}`);
                    console.log(`  vehicleMaster:`, vehicle.vehicleMaster);
                    console.log(`  image:`, vehicle.image);
                    console.log(`---`);
                });
                
                vehiclesData = finalVehiclesData;
                console.log('=== END DEBUG ===');
                
                setExtractedData({ "VEHICLES": vehiclesData });
                form.setFieldsValue({
                    ...initialData,
                    date: initialData.date ? dayjs(initialData.date) : null,
                    daDate: initialData.daDate ? dayjs(initialData.daDate) : null,
                });
            } else {
                console.log('=== DEBUG: No initialData (Import Mode) ===');
                setExtractedData(null);
                form.resetFields();
            }
        };

        if (open) {
            processInitialData();
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

                // Helper to parse dates like "31-Jan-2026" or "31-01-2026"
                const parseDate = (d: string) => {
                    if (!d) return null;
                    // Try DD-MM-YYYY format first
                    let parsed = dayjs(d, 'DD-MM-YYYY');
                    if (parsed.isValid()) return parsed;
                    // Fallback to DD-MMM-YYYY format
                    parsed = dayjs(d, 'DD-MMM-YYYY');
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
            const errorMessage = err.response?.data?.message || 'Action failed';
            const isDuplicate = err.response?.data?.isDuplicate;
            
            if (isDuplicate) {
                message.error('Inward record already exists');
            } else {
                message.error(errorMessage);
            }
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const handleCellChange = (value: string, rowIndex: number, dataIndex: string) => {
        const updated = [...extractedData["VEHICLES"]];
        updated[rowIndex] = {
            ...updated[rowIndex],
            [dataIndex]: value
        };

        setExtractedData({
            ...extractedData,
            VEHICLES: updated
        });
    };

    const getEditableColumn = (title: string, dataIndex: string) => ({
        title,
        dataIndex,
        key: dataIndex,
        render: (_: any, record: any, rowIndex: number) => {
            // DEBUG: Log what data is being rendered in the table
            if (dataIndex === 'modelCode' || dataIndex === 'qty' || dataIndex === 'chassisNo' || dataIndex === 'engineNo' || dataIndex === 'colorCode') {
                console.log(`=== DEBUG: Table Render ===`);
                console.log(`Column: ${title} (${dataIndex})`);
                console.log(`Row: ${rowIndex}`);
                console.log(`Record:`, record);
                console.log(`Value for ${dataIndex}:`, record[dataIndex]);
                console.log(`=== END RENDER DEBUG ===`);
            }
            
            const isEditing =
                editingCell?.rowIndex === rowIndex &&
                editingCell?.dataIndex === dataIndex;

            return isEditing ? (
                <Input
                    autoFocus
                    defaultValue={record[dataIndex]}
                    onBlur={(e) => {
                        handleCellChange(e.target.value, rowIndex, dataIndex);
                        setEditingCell(null);
                    }}
                    onPressEnter={(e) => {
                        handleCellChange((e.target as any).value, rowIndex, dataIndex);
                        setEditingCell(null);
                    }}
                />
            ) : (
                <div
                    onDoubleClick={() =>
                        setEditingCell({ rowIndex, dataIndex })
                    }
                    style={{ cursor: 'pointer', padding: '4px 8px', minHeight: '22px' }}
                >
                    {record[dataIndex] || ''}
                </div>
            );
        }
    });

    const vehicleColumns = [
        getEditableColumn('Model Code', 'modelCode'),
        getEditableColumn('Qty', 'qty'),
        getEditableColumn('Chassis No', 'chassisNo'),
        getEditableColumn('Engine No', 'engineNo'),
        getEditableColumn('Color', 'colorCode'),
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
                            <Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" /></Form.Item>
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
                            <Form.Item name="daDate" label="DA Date"><DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" /></Form.Item>
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
                        scroll={{ x: true }}
                    />
                </Form>
            )}
        </Modal>
    );
};

export default InwardImportModal;
