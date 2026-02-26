import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, Row, Col, Typography, Button, message } from 'antd';
import { getCountries, getStates, getCities } from '../../api/onboarding'; // Assuming these exist or need to be created
import styles from './Manufacturer.module.css';

const { Title } = Typography;
const { Option } = Select;

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
                if (formattedValues.countryId) handleCountryChange(formattedValues.countryId);
                if (formattedValues.stateId) handleStateChange(formattedValues.stateId);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleCountryChange = async (countryId: string) => {
        try {
            const res = await getStates(countryId);
            setStates(res.data || []);
            setCities([]);
        } catch (error) {
            message.error('Failed to fetch states');
        }
    };

    const handleStateChange = async (stateId: string) => {
        try {
            const res = await getCities(stateId);
            setCities(res.data || []);
        } catch (error) {
            message.error('Failed to fetch cities');
        }
    };

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            onSave(values);
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1000}
            confirmLoading={loading}
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
                    loading={loading}
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
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Company Name"
                            rules={[{ required: true, message: 'Please enter company name' }]}
                        >
                            <Input placeholder="Enter company name" disabled={readOnly} />
                        </Form.Item>

                        <Form.Item name="code" label="Manufacturer Code">
                            <Input placeholder="Enter manufacturer code" disabled={readOnly} />
                        </Form.Item>

                        <Form.Item
                            name="gst"
                            label="GST Number"
                            rules={[{ required: true, message: 'Please enter GST number' }]}
                        >
                            <Input placeholder="Enter GST number" disabled={readOnly} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="E-Mail"
                            rules={[{ required: true, type: 'email', message: 'Please enter a valid email address' }]}
                        >
                            <Input placeholder="Enter company email" disabled={readOnly} />
                        </Form.Item>
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
                        >
                            <Input placeholder="Enter address line 1" disabled={readOnly} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="line2" label="Address Line 2">
                            <Input placeholder="Enter address line 2" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="line3" label="Address Line 3">
                            <Input placeholder="Enter address line 3" disabled={readOnly} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="locality" label="Locality">
                            <Input placeholder="Enter locality or area" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="countryId"
                            label="Country"
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
                        >
                            <Select placeholder="Select state" onChange={handleStateChange} disabled={readOnly} allowClear>
                                {states.map(s => (
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
                        >
                            <Select placeholder="Select city" disabled={readOnly} allowClear>
                                {cities.map(ct => (
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
    );
};

export default ManufacturerModal;
