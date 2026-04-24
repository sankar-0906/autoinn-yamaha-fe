import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, Row, Col, Typography, Button, message, Upload, Space } from 'antd';
import { InboxOutlined, LoadingOutlined, EyeOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getCountries, getStates, getCities } from '../../api/onboarding';
import { uploadImage } from '../../api/upload';
import { verifyGST } from '../../api/gstVerify';
import styles from './Manufacturer.module.css';

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface ManufacturerModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const ManufacturerModal: React.FC<ManufacturerModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [logo, setLogo] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [gstName, setGstName] = useState('');
    const [gstStatus, setGstStatus] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const countryRes = await getCountries();
                setCountries(countryRes.data.data || []);
            } catch (error) {
                message.error('Failed to fetch countries');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                const formattedValues = {
                    ...initialValues,
                    line1: initialValues.address?.line1,
                    line2: initialValues.address?.line2,
                    line3: initialValues.address?.line3,
                    locality: initialValues.address?.locality,
                    countryId: initialValues.address?.countryId,
                    stateId: initialValues.address?.stateId,
                    cityId: initialValues.address?.cityId,
                    pincode: initialValues.address?.pincode,
                };
                form.setFieldsValue(formattedValues);
                setLogo(initialValues.logo || null);
                setGstName('');
                setGstStatus('');
                if (formattedValues.countryId) handleCountryChange(formattedValues.countryId);
                if (formattedValues.stateId) handleStateChange(formattedValues.stateId);
            } else {
                form.resetFields();
                setLogo(null);
                setGstName('');
                setGstStatus('');
            }
        }
    }, [open, initialValues, form]);

    const handleCountryChange = async (countryId: string) => {
        try {
            const res = await getStates(countryId);
            setStates(res.data.data || []);
            setCities([]);
        } catch (error) {
            message.error('Failed to fetch states');
        }
    };

    const handleStateChange = async (stateId: string) => {
        try {
            const res = await getCities(stateId);
            setCities(res.data.data || []);
        } catch (error) {
            message.error('Failed to fetch cities');
        }
    };

    const handleGstChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        form.setFieldsValue({ gst: val });

        if (val.length === 15) {
            try {
                const res = await verifyGST(val);
                const { data } = res;
                if (data.code === 200 && data.response?.code === 200) {
                    const gstData = data.response.data.data;
                    if (gstData.error) {
                        message.error('Invalid GST Number');
                        setGstName('');
                        setGstStatus('');
                    } else {
                        message.success('GST Verified');
                        setGstName(gstData.taxpayerInfo?.tradeNam || gstData.taxpayerInfo?.lgnm || '');
                        setGstStatus(gstData.taxpayerInfo?.sts || '');
                    }
                } else {
                    setGstName('');
                    setGstStatus('');
                }
            } catch (error) {
                console.error('GST verification failed', error);
                setGstName('');
                setGstStatus('');
            }
        } else {
            setGstName('');
            setGstStatus('');
        }
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG/GIF files!');
        }
        const isLt10M = (file.size as number) / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Image must be smaller than 10MB!');
        }
        return isJpgOrPng && isLt10M;
    };

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await uploadImage(formData);
            if (res.data.success) {
                const url = res.data.data.url;
                setLogo(url);
                onSuccess(res.data.data);
                message.success('Logo uploaded successfully');
            } else {
                onError(new Error('Upload failed'));
            }
        } catch (error) {
            onError(error);
            message.error('Logo upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            onSave({ ...values, logo });
        });
    };

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                onOk={handleOk}
                width={1000}
                confirmLoading={loading || uploading}
                title={<div className={styles.modalTitle}>{readOnly ? "View Manufacturer" : (initialValues ? "Modify Manufacturer" : "Add Manufacturer")}</div>}
                footer={readOnly ? [
                    <Button key="close" onClick={onClose}>Close</Button>
                ] : [
                    <Button key="cancel" onClick={onClose}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading || uploading}
                        onClick={handleOk}
                        style={{ background: '#1a8a7a', borderColor: '#1a8a7a' }}
                    >
                        {initialValues ? 'Update' : 'Save'}
                    </Button>
                ]}
                centered
            >
                <Form form={form} layout="vertical">
                    <Row gutter={24}>
                        <Col span={16}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Company Name"
                                        rules={[{ required: true, message: 'Please enter company name' }]}
                                        className={styles.compactFormItem}
                                    >
                                        <Input placeholder="Enter company name" disabled={readOnly} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="E-Mail"
                                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email address' }]}
                                        className={styles.compactFormItem}
                                    >
                                        <Input placeholder="Enter company email" disabled={readOnly} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="code"
                                        label="Manufacturer Code"
                                        className={styles.compactFormItem}
                                    >
                                        <Input placeholder="Enter manufacturer code" disabled={readOnly} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="gst"
                                        label="GST Number"
                                        rules={[{ required: true, message: 'Please enter GST number' }]}
                                        className={styles.compactFormItem}
                                    >
                                        <Input
                                            placeholder="Enter GST number"
                                            disabled={readOnly}
                                            maxLength={15}
                                            onChange={handleGstChange}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </Form.Item>
                                    {gstName && (
                                        <div style={{ marginTop: '-8px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                                            <span style={{ color: '#52c41a', fontSize: '12px' }}>
                                                {gstName} ({gstStatus})
                                            </span>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>

                        <Col span={8}>
                            <div className={styles.logoLabel}>Manufacturer Logo</div>
                            <Dragger
                                disabled={readOnly}
                                name="image"
                                multiple={false}
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                customRequest={customRequest}
                                className={styles.logoUploadContainer}
                            >
                                {logo ? (
                                    <div style={{ position: 'relative', padding: '10px' }}>
                                        <img src={logo} alt="logo" className={styles.logoPreview} />
                                        <div style={{ marginTop: '8px' }}>
                                            <Space>
                                                <Button
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
                                                >
                                                    View
                                                </Button>
                                                {!readOnly && (
                                                    <Button
                                                        size="small"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={(e) => { e.stopPropagation(); setLogo(null); }}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </Space>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="ant-upload-drag-icon">
                                            {uploading ? <LoadingOutlined style={{ color: '#1a8a7a' }} /> : <InboxOutlined style={{ color: '#1a8a7a' }} />}
                                        </p>
                                        <p className="ant-upload-text">Click or drag logo</p>
                                        <p className="ant-upload-hint">Single upload</p>
                                    </div>
                                )}
                            </Dragger>
                        </Col>
                    </Row>

                    <Title level={5} className={styles.sectionTitle}>
                        Address
                    </Title>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="line1"
                                label="Address Line 1"
                                rules={[{ required: true, message: 'Please enter address line 1' }]}
                                className={styles.compactFormItem}
                            >
                                <Input placeholder="Enter address line 1" disabled={readOnly} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="line2" label="Address Line 2" className={styles.compactFormItem}>
                                <Input placeholder="Enter address line 2" disabled={readOnly} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="line3" label="Address Line 3" className={styles.compactFormItem}>
                                <Input placeholder="Enter address line 3" disabled={readOnly} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="locality" label="Locality" className={styles.compactFormItem}>
                                <Input placeholder="Enter locality or area" disabled={readOnly} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="countryId"
                                label="Country"
                                rules={[{ required: true, message: 'Please select country' }]}
                                className={styles.compactFormItem}
                            >
                                <Select placeholder="Select country" onChange={handleCountryChange} disabled={readOnly} allowClear>
                                    {countries?.map(c => (
                                        <Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="stateId"
                                label="State"
                                rules={[{ required: true, message: 'Please select state' }]}
                                className={styles.compactFormItem}
                            >
                                <Select placeholder="Select state" onChange={handleStateChange} disabled={readOnly} allowClear>
                                    {states?.map(s => (
                                        <Option key={s.id} value={s.id}>
                                            {s.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="cityId"
                                label="City"
                                rules={[{ required: true, message: 'Please select city' }]}
                                className={styles.compactFormItem}
                            >
                                <Select placeholder="Select city" disabled={readOnly} allowClear>
                                    {cities?.map(ct => (
                                        <Option key={ct.id} value={ct.id}>
                                            {ct.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="pincode"
                                label="Pincode"
                                rules={[{ required: true, message: 'Please enter pincode' }]}
                                className={styles.compactFormItem}
                            >
                                <Input placeholder="Enter pincode" disabled={readOnly} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="vehicleManufacturer" valuePropName="checked">
                        <Checkbox disabled={readOnly}>Vehicle Manufacturer : Yes</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={previewOpen}
                title="Manufacturer Logo"
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                centered
            >
                <img alt="logo preview" style={{ width: '100%' }} src={logo || ''} />
            </Modal>
        </>
    );
};

export default ManufacturerModal;
