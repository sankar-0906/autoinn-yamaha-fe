import React, { useState, useEffect } from 'react';
import {
    Upload, Button, message, Form, Input, Row, Col, Table, Typography, DatePicker, Space, Card, Spin, Select
} from 'antd';
import { InboxOutlined, SaveOutlined, EditOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { processInwardPdf, createVehicleStockInward, updateVehicleStockInward, getVehicleStockInwardById, lookupVehicleImage, getInwardPdfJobStatus } from '../../api/vehicleStockInward';
import { getUniqueModels, getColorsByModel } from '../../api/vehicleMaster';
import { getDealers } from '../../api/dealer';
import { getBranches } from '../../api/branch';
import dayjs from 'dayjs';
import styles from './VehicleStockInward.module.css';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const InwardImportPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [rowColors, setRowColors] = useState<Record<number, any[]>>({});
    const [dealers, setDealers] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [entryMode, setEntryMode] = useState<'choice' | 'pdf' | 'manual' | 'data'>(id ? 'data' : 'choice');
    const [, setJobId] = useState<string | null>(null);

    // Determine mode based on URL
    const isEditMode = location.pathname.includes('/edit/');
    const isViewOnly = location.pathname.includes('/view/');

    const fetchData = async () => {
        if (id) {
            setLoading(true);
            try {
                const res = await getVehicleStockInwardById(id);
                if (res.data.success) {
                    const initialData = res.data.data;

                    // Check for both legacy items and new VEHICLES array
                    let vehiclesData = [];
                    if (initialData.VEHICLES && Array.isArray(initialData.VEHICLES) && initialData.VEHICLES.length > 0) {
                        vehiclesData = initialData.VEHICLES;
                    } else if (initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
                        vehiclesData = initialData.items.map((item: any) => ({
                            ...item,
                            modelCode: item.vehicleMaster?.modelCode || 'UNKNOWN',
                            qty: 1,
                            colorCode: item.image?.code || 'UNKNOWN'
                        }));
                    }

                    // Group vehicles by model code to calculate proper quantities
                    const groupedVehicles = vehiclesData.reduce((groups: any, vehicle: any) => {
                        const modelCode = vehicle.modelCode;
                        if (!groups[modelCode]) {
                            groups[modelCode] = { modelCode, qty: 0, vehicles: [] };
                        }
                        groups[modelCode].qty += 1;
                        groups[modelCode].vehicles.push(vehicle);
                        return groups;
                    }, {});

                    const finalVehiclesData = await Promise.all(Object.values(groupedVehicles).flatMap((group: any) =>
                        group.vehicles.map(async (vehicle: any) => {
                            let modelCode = vehicle.modelCode || '';
                            let colorCode = vehicle.colorCode || '';
                            let imageUrl = vehicle.imageUrl;

                            if (modelCode.includes('-')) {
                                [modelCode, colorCode] = modelCode.split('-');
                            }

                            if (modelCode && colorCode && !imageUrl) {
                                try {
                                    const res = await lookupVehicleImage(modelCode, colorCode);
                                    imageUrl = res.data?.data || '';
                                } catch (e) { }
                            }

                            return {
                                ...vehicle,
                                modelCode,
                                colorCode,
                                qty: group.qty,
                                imageUrl
                            };
                        })
                    ));

                    setExtractedData({ "VEHICLES": finalVehiclesData });
                    form.setFieldsValue({
                        ...initialData,
                        date: initialData.date ? dayjs(initialData.date) : null,
                        daDate: initialData.daDate ? dayjs(initialData.daDate) : null,
                        branchId: initialData.branchId
                    });
                }
            } catch (err) {
                message.error('Failed to fetch record details');
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [modelsRes, dealersRes, branchesRes] = await Promise.all([
                    getUniqueModels(),
                    getDealers({ limit: 1000 }),
                    getBranches({ page: 1, size: 1000 })
                ]);
                setAvailableModels(modelsRes.data || []);
                setDealers(dealersRes.data?.dealers || dealersRes.dealers || []);
                setBranches(branchesRes.data?.data?.branch || branchesRes.data?.branch || []);
            } catch (error) {
                console.error('Failed to fetch metadata', error);
            }
        };
        fetchMetadata();
        fetchData();
    }, [id, form]);

    useEffect(() => {
        const fetchMissingImages = async () => {
            if (extractedData?.VEHICLES && extractedData.VEHICLES.length > 0) {
                let changed = false;
                const newVehicles = [...extractedData.VEHICLES];

                for (let i = 0; i < newVehicles.length; i++) {
                    const v = newVehicles[i];
                    // If we have codes but NO image (undefined or empty string), try to fetch it
                    if (v.modelCode && v.colorCode && !v.imageUrl) {
                        try {
                            const res = await lookupVehicleImage(v.modelCode, v.colorCode);
                            if (res.data.success && res.data.data) {
                                newVehicles[i].imageUrl = res.data.data;
                                changed = true;
                            } else {
                                // Mark as NONE so we don't keep retrying if not found
                                newVehicles[i].imageUrl = 'NONE';
                                changed = true;
                            }
                        } catch (err) {
                            newVehicles[i].imageUrl = 'NONE';
                            changed = true;
                        }
                    }
                }

                if (changed) {
                    setExtractedData(prev => ({ ...prev, VEHICLES: newVehicles }));
                }
            }
        };

        fetchMissingImages();
    }, [extractedData?.VEHICLES]);

    const pollJob = async (jobId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await getInwardPdfJobStatus(jobId);
                const job = res.data;

                if (job.status === 'done') {
                    clearInterval(interval);
                    setJobId(null);
                    await handlePdfProcessingComplete(job.data);
                } else if (job.status === 'error') {
                    clearInterval(interval);
                    setJobId(null);
                    setLoading(false);
                    setProcessingStep('');
                    message.error(job.message || 'PDF processing failed');
                }
            } catch (err) {
                clearInterval(interval);
                setJobId(null);
                setLoading(false);
                setProcessingStep('');
                message.error('Failed to check processing status');
            }
        }, 3000);
    };

    const handlePdfProcessingComplete = async (data: any) => {
        try {
            if (data["VEHICLES"]) {
                data["VEHICLES"] = await Promise.all(data["VEHICLES"].map(async (v: any) => {
                    let modelCode = v.modelCode || '';
                    let colorCode = v.colorCode || '';
                    let imageUrl = v.imageUrl || '';

                    if (modelCode.includes('-')) {
                        const parts = modelCode.split('-');
                        modelCode = parts[0];
                        if (!colorCode) colorCode = parts[1] || '';
                    }

                    if (modelCode && colorCode) {
                        try {
                            const imgRes = await lookupVehicleImage(modelCode, colorCode);
                            imageUrl = imgRes.data?.data || '';
                        } catch (e) { }
                    }

                    return { ...v, modelCode, colorCode, imageUrl };
                }));
            }

            setExtractedData(data);

            const parseDate = (d: string) => {
                if (!d) return null;
                let parsed = dayjs(d, 'DD-MM-YYYY');
                if (parsed.isValid()) return parsed;
                parsed = dayjs(d, 'DD-MMM-YYYY');
                return parsed.isValid() ? parsed : dayjs(d);
            };

            form.setFieldsValue({
                address: data["ADDRESS"],
                deliveryAddress: data["ADDRESS OF DELIVERY"],
                invoiceNo: data["INVOICE NO"]?.toUpperCase(),
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
            message.success('Data extraction successful! Please select the Dealer and Branch.');
        } catch (err: any) {
            message.error('Data processing failed');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const handleFileUpload = async (file: File) => {
        setLoading(true);
        setProcessingStep('Uploading PDF for processing...');
        try {
            const res = await processInwardPdf(file);
            if (res.data.success && res.data.jobId) {
                setJobId(res.data.jobId);
                setProcessingStep('Processing PDF with OCR...');
                pollJob(res.data.jobId);
            } else {
                throw new Error('No job ID returned from server');
            }
        } catch (err: any) {
            setLoading(false);
            setProcessingStep('');
            message.error(err.response?.data?.message || 'Failed to start PDF processing');
        }
        return false;
    };

    const handleManualEntry = () => {
        form.resetFields();
        setExtractedData({ "VEHICLES": [] });
        setEntryMode('manual');
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const vehicles = extractedData?.VEHICLES || [];
            if (vehicles.length === 0) {
                message.error('Please add at least one vehicle');
                return;
            }

            setLoading(true);
            setProcessingStep(isEditMode ? 'Updating Record...' : 'Saving to Database...');

            const payload = {
                ...values,
                date: values.date?.toISOString(),
                daDate: values.daDate?.toISOString(),
                vehicles: extractedData["VEHICLES"]
            };

            const res = isEditMode
                ? await updateVehicleStockInward(id!, payload)
                : await createVehicleStockInward(payload);

            if (res.data.success) {
                message.success(isEditMode ? 'Inward record updated successfully' : 'Inward record saved successfully');
                navigate('/company/vehicle-stock-inward');
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const handleCellChange = async (value: string, rowIndex: number, dataIndex: string) => {
        let processedValue = value?.toUpperCase() || '';
        if (dataIndex === 'chassisNo' || dataIndex === 'engineNo') {
            processedValue = processedValue.replace(/[^A-Z0-9]/g, '');
            if (processedValue.length > 17) processedValue = processedValue.slice(0, 17);
        }

        const updated = [...extractedData["VEHICLES"]];
        const row = { ...updated[rowIndex], [dataIndex]: processedValue };

        if (dataIndex === 'modelCode') {
            row.colorCode = '';
            try {
                const colorRes = await getColorsByModel(processedValue);
                setRowColors((prev: Record<number, any[]>) => ({ ...prev, [rowIndex]: colorRes.data || [] }));
            } catch (e) { }
        }

        if ((dataIndex === 'modelCode' || dataIndex === 'colorCode') && row.modelCode) {
            try {
                const imgRes = await lookupVehicleImage(row.modelCode, row.colorCode);
                row.imageUrl = imgRes.data?.data || '';
            } catch (e) { }
        }

        updated[rowIndex] = row;
        setExtractedData({ ...extractedData, VEHICLES: updated });
    };

    const handleAddVehicle = () => {
        const newVehicle = { modelCode: '', chassisNo: '', engineNo: '', colorCode: '', qty: 1 };
        setExtractedData((prev: any) => ({ ...prev, VEHICLES: [...(prev?.VEHICLES || []), newVehicle] }));
    };

    const handleCancel = () => {
        navigate('/company/vehicle-stock-inward');
    };

    const getEditableColumn = (title: string, dataIndex: string) => ({
        title,
        dataIndex,
        key: dataIndex,
        render: (_: any, record: any, rowIndex: number) => {
            if (isViewOnly) return <div style={{ padding: '4px 11px' }}>{record[dataIndex] || ''}</div>;
            return (
                <Input
                    value={record[dataIndex]}
                    onChange={(e) => handleCellChange(e.target.value, rowIndex, dataIndex)}
                    style={{ borderRadius: 0, textTransform: 'uppercase' }}
                    maxLength={(dataIndex === 'chassisNo' || dataIndex === 'engineNo') ? 17 : undefined}
                />
            );
        }
    });

    const vehicleColumns = [
        {
            title: 'S.No',
            dataIndex: 'sno',
            key: 'sno',
            render: (_: any, __: any, index: number) => index + 1,
            width: 70,
        },
        {
            title: 'Model Code',
            dataIndex: 'modelCode',
            key: 'modelCode',
            width: 200,
            render: (text: string, _record: any, rowIndex: number) => (
                <Select
                    showSearch
                    className={styles.uppercaseSearch}
                    style={{ width: '100%' }}
                    value={text}
                    disabled={isViewOnly}
                    onChange={(val: string) => handleCellChange(val, rowIndex, 'modelCode')}
                    options={availableModels.map(m => ({ label: m.toUpperCase(), value: m.toUpperCase() }))}
                    optionFilterProp="label"
                />
            )
        },
        getEditableColumn('Chassis No', 'chassisNo'),
        getEditableColumn('Engine No', 'engineNo'),
        {
            title: 'Color',
            dataIndex: 'colorCode',
            key: 'colorCode',
            width: 150,
            render: (text: string, record: any, rowIndex: number) => {
                const colors = rowColors[rowIndex] || [];
                return (
                    <Select
                        className={styles.uppercaseSearch}
                        style={{ width: '100%' }}
                        value={text}
                        disabled={isViewOnly || !record.modelCode}
                        onChange={(val: string) => handleCellChange(val, rowIndex, 'colorCode')}
                        onFocus={async () => {
                            if (record.modelCode && (!colors || colors.length === 0)) {
                                try {
                                    const res = await getColorsByModel(record.modelCode);
                                    setRowColors((prev: Record<number, any[]>) => ({ ...prev, [rowIndex]: res.data || [] }));
                                } catch (e) { }
                            }
                        }}
                        options={colors.map((c: any) => ({ label: c.code.toUpperCase(), value: c.code.toUpperCase() }))}
                        optionFilterProp="label"
                    />
                );
            }
        },
        {
            title: 'Vehicle Color View',
            key: 'vehicleImage',
            align: 'center' as const,
            render: (_: any, record: any) => (
                record.imageUrl && record.imageUrl !== 'NONE' ? (
                    <div style={{ padding: '8px 0' }}>
                        <img src={record.imageUrl} alt="vehicle" style={{ width: 320, height: 180, objectFit: 'contain', border: '1px solid #f0f0f0', background: '#fff', borderRadius: '12px', padding: '8px' }} />
                    </div>
                ) : (
                    <div style={{ width: 320, height: 180, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#bfbfbf', border: '1px dashed #d9d9d9', borderRadius: '12px', margin: '0 auto' }}>No Image</div>
                )
            ),
            width: 350,
        },
        ...(!isViewOnly ? [{
            title: 'Action',
            key: 'delete',
            width: 70,
            render: (_: any, __: any, rowIndex: number) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
                    const updated = [...extractedData["VEHICLES"]];
                    updated.splice(rowIndex, 1);
                    setExtractedData({ ...extractedData, VEHICLES: updated });
                }} />
            )
        }] : [])
    ];

    const getPageTitle = () => {
        if (isViewOnly) return "View Inward Record";
        if (isEditMode) return "Edit Inward Record";
        if (entryMode === 'manual') return "Manual Inward Entry";
        return "Inward Record";
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <Space size="large">
                    <Button icon={<ArrowLeftOutlined />} shape="circle" onClick={() => navigate('/company/vehicle-stock-inward')} />
                    <Title level={4} style={{ margin: 0 }}>{getPageTitle()}</Title>
                </Space>
            </div>

            <Card className={styles.cardContainer}>
                {loading && !extractedData && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 15 }}>{processingStep || 'Loading...'}</div>
                    </div>
                )}

                {loading && extractedData && (
                    <div className={styles.processingOverlay}>
                        <Spin size="large" />
                        <Text strong style={{ color: '#1a8a7a', marginTop: 15 }}>{processingStep}</Text>
                    </div>
                )}

                {!extractedData && !loading && entryMode === 'choice' && (
                    <div className={styles.choiceContainer}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Card
                                    hoverable
                                    className={`${styles.choiceCard} ${styles.pdfCard}`}
                                    onClick={() => setEntryMode('pdf')}
                                >
                                    <div className={styles.choiceIcon}>
                                        <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                                    </div>
                                    <Title level={4}>Import from PDF</Title>
                                    <Text type="secondary">Upload Yamaha Dispatch Advice PDF for automatic extraction</Text>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card
                                    hoverable
                                    className={`${styles.choiceCard} ${styles.manualCard}`}
                                    onClick={handleManualEntry}
                                >
                                    <div className={styles.choiceIcon}>
                                        <EditOutlined style={{ color: '#1a8a7a' }} />
                                    </div>
                                    <Title level={4}>Manual Entry</Title>
                                    <Text type="secondary">Create a fresh inward record and enter details manually</Text>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}

                {!extractedData && !loading && entryMode === 'pdf' && (
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setEntryMode('choice')}
                            >
                                Back to options
                            </Button>
                        </div>
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
                )}

                {extractedData && (
                    <Form form={form} layout="vertical" disabled={isViewOnly}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="dealerName" label="Dealer Name" rules={[{ required: true, message: 'Select dealer' }]}>
                                    <Select showSearch placeholder="Select Dealer" optionFilterProp="children">
                                        {dealers.map(d => (
                                            <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="branchId" label="Branch" rules={[{ required: true, message: 'Select branch' }]}>
                                    <Select showSearch placeholder="Select Branch" optionFilterProp="children">
                                        {branches.map(b => (
                                            <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="invoiceNo" label="Invoice No" getValueFromEvent={(e) => e.target.value.toUpperCase()}>
                                    <Input style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}><Form.Item name="date" label="Date"><DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" /></Form.Item></Col>
                            
                            <Col span={12}><Form.Item name="address" label="Billing Address"><Input.TextArea rows={1} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="deliveryAddress" label="Shipping Address"><Input.TextArea rows={1} /></Form.Item></Col>
                            
                            <Col span={8}><Form.Item name="placeOfSupply" label="Policy of Supply"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="daNumber" label="DA Number"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="daDate" label="DA Date"><DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} /></Form.Item></Col>

                            <Col span={8}><Form.Item name="modeOfTransport" label="Mode of Dispatch"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="transporter" label="Transporter"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="vehicleNo" label="Vehicle No"><Input /></Form.Item></Col>

                            <Col span={8}><Form.Item name="from" label="From"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="to" label="To"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="insuranceCo" label="Insurance No"><Input /></Form.Item></Col>
                            <Col span={8}><Form.Item name="policyNumber" label="Policy No"><Input /></Form.Item></Col>
                        </Row>

                        <Title level={5} style={{ marginTop: 20 }}>Vehicles List</Title>
                        <Table dataSource={extractedData["VEHICLES"]} columns={vehicleColumns} pagination={false} rowKey={(_, index) => index!} scroll={{ x: true }} />

                        {!isViewOnly && (
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                                <Button icon={<PlusOutlined />} onClick={handleAddVehicle} style={{ borderColor: '#1a8a7a', color: '#1a8a7a' }}>Add Vehicle</Button>
                                <Space>
                                    <Button type="primary" icon={isEditMode ? <EditOutlined /> : <SaveOutlined />} loading={loading} onClick={handleSave} style={{ backgroundColor: '#1a8a7a', borderColor: '#1a8a7a' }}>
                                        {isEditMode ? 'Update Record' : 'Save Record'}
                                    </Button>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                </Space>
                            </div>
                        )}
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default InwardImportPage;
