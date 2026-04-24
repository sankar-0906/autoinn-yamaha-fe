import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getCountries, getStates, getCities } from '../../api/location';
import { getBranches } from '../../api/branch';
import { verifyGST } from '../../api/gstVerify';
import styles from './DealerMaster.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface DealerMasterModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const DealerMasterModal: React.FC<DealerMasterModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [gstName, setGstName] = useState('');
    const [gstStatus, setGstStatus] = useState('');

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await getCountries();
                setCountries(res.data?.data || res.data || []);
            } catch (error) { }
        };
        const fetchBranches = async () => {
            try {
                const res = await getBranches();
                // Extract from result.branch as per backend structure
                const fetchedBranches = res.data?.data?.branch || res.data?.branch || res.data?.data || res.data || [];
                setBranches(Array.isArray(fetchedBranches) ? fetchedBranches : []);
            } catch (error) {
                setBranches([]);
            }
        };
        fetchCountries();
        fetchBranches();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Map shippingAddresses to shippingAddress for form compatibility
                const shippingArr = initialValues.shippingAddresses || initialValues.shippingAddress || [];
                const values = {
                    ...initialValues,
                    shippingAddress: shippingArr
                };
                form.setFieldsValue(values);
                setGstName('');
                setGstStatus('');

                // Pre-fetch all location data for all addresses
                const preFetchData = async () => {
                    const allAddresses = [initialValues.address, ...shippingArr].filter(Boolean);
                    const countryIds = [...new Set(allAddresses.map(a => a.countryId).filter(Boolean))];
                    const stateIds = [...new Set(allAddresses.map(a => a.stateId).filter(Boolean))];

                    // Fetch states for all used countries
                    for (const cid of countryIds) {
                        try {
                            const res = await getStates(cid);
                            const newStates = res.data?.data || res.data || [];
                            setStates(prev => {
                                const existingIds = prev.map(s => s.id);
                                return [...prev, ...newStates.filter((s: any) => !existingIds.includes(s.id))];
                            });
                        } catch (e) { }
                    }

                    // Fetch cities for all used states
                    for (const sid of stateIds) {
                        try {
                            const res = await getCities(sid);
                            const newCities = res.data?.data || res.data || [];
                            setCities(prev => {
                                const existingIds = prev.map(c => c.id);
                                return [...prev, ...newCities.filter((c: any) => !existingIds.includes(c.id))];
                            });
                        } catch (e) { }
                    }
                };
                preFetchData();
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleCountryChange = async (value: string, type: 'billing' | number) => {
        try {
            const res = await getStates(value);
            const newStates = res.data?.data || res.data || [];
            setStates(prev => {
                const existingIds = prev.map(s => s.id);
                return [...prev, ...newStates.filter((s: any) => !existingIds.includes(s.id))];
            });

            if (type === 'billing') {
                form.setFieldsValue({ address: { stateId: undefined, cityId: undefined } });
            } else if (typeof type === 'number') {
                const shippingAddress = form.getFieldValue('shippingAddress');
                shippingAddress[type] = {
                    ...shippingAddress[type],
                    stateId: undefined,
                    cityId: undefined
                };
                form.setFieldsValue({ shippingAddress });
            }
        } catch (error) { }
    };

    const handleStateChange = async (value: string, type: 'billing' | number) => {
        try {
            const res = await getCities(value);
            const newCities = res.data?.data || res.data || [];
            setCities(prev => {
                const existingIds = prev.map(c => c.id);
                return [...prev, ...newCities.filter((c: any) => !existingIds.includes(c.id))];
            });

            if (type === 'billing') {
                form.setFieldsValue({ address: { cityId: undefined } });
            } else if (typeof type === 'number') {
                const shippingAddress = form.getFieldValue('shippingAddress');
                shippingAddress[type] = {
                    ...shippingAddress[type],
                    cityId: undefined
                };
                form.setFieldsValue({ shippingAddress });
            }
        } catch (error) { }
    };

    const handleGstChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        form.setFieldsValue({ GSTIN: val });

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
                setGstName('');
                setGstStatus('');
            }
        } else {
            setGstName('');
            setGstStatus('');
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
            title={
                <div className={styles.modalHeader}>
                    <Title level={4} className={styles.modalTitle}>Dealer Master</Title>
                </div>
            }
            footer={readOnly ? [
                <Button key="close" onClick={onClose}>Close</Button>
            ] : [
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} className={styles.addBtn}>
                    {initialValues?.id ? 'Update' : 'Save'}
                </Button>
            ]}
            centered
            bodyStyle={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="name" label={<span className={styles.formLabel}>Dealer Name</span>} rules={[{ required: true }]}>
                            <Input placeholder="Enter Dealer Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dealerType" label={<span className={styles.formLabel}>GST Dealer Type</span>}>
                            <Select placeholder="Select GST Dealer Type" disabled={readOnly} allowClear>
                                <Option value="Registered Dealer">Registered Dealer</Option>
                                <Option value="Unregistered Dealer">Unregistered Dealer</Option>
                                <Option value="Composition Dealer">Composition Dealer</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="status" label={<span className={styles.formLabel}>Status</span>} rules={[{ required: true }]}>
                            <Select placeholder="Select Status" disabled={readOnly} allowClear>
                                <Option value="Active">Active</Option>
                                <Option value="Inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="GSTIN" label={<span className={styles.formLabel}>GSTIN</span>}>
                            <Input
                                placeholder="Enter GSTIN"
                                disabled={readOnly}
                                maxLength={15}
                                onChange={handleGstChange}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </Form.Item>
                        {gstName && (
                            <div style={{ marginTop: '-20px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                                <span style={{ color: '#52c41a', fontSize: '12px' }}>
                                    {gstName} ({gstStatus})
                                </span>
                            </div>
                        )}
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="email" label={<span className={styles.formLabel}>Email</span>}>
                            <Input placeholder="Enter Email" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>Billing Address</Text>
                </div>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name={['address', 'line1']} label={<span className={styles.formLabel}>Address Line 1</span>} rules={[{ required: true }]}>
                            <Input placeholder="Address Line 1" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={['address', 'line2']} label={<span className={styles.formLabel}>Address Line 2</span>}>
                            <Input placeholder="Address Line 2" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name={['address', 'line3']} label={<span className={styles.formLabel}>Address Line 3</span>}>
                            <Input placeholder="Address Line 3" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={['address', 'locality']} label={<span className={styles.formLabel}>Locality</span>} rules={[{ required: true }]}>
                            <Input placeholder="Locality" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name={['address', 'countryId']} label={<span className={styles.formLabel}>Country</span>}>
                            <Select placeholder="Select" disabled={readOnly} allowClear onChange={(v) => handleCountryChange(v, 'billing')}>
                                {countries.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['address', 'stateId']} label={<span className={styles.formLabel}>State</span>}>
                            <Select placeholder="Select" disabled={readOnly} allowClear onChange={(v) => handleStateChange(v, 'billing')}>
                                {states.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['address', 'cityId']} label={<span className={styles.formLabel}>City</span>}>
                            <Select placeholder="Select" disabled={readOnly} allowClear>
                                {cities.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['address', 'pincode']} label={<span className={styles.formLabel}>Pincode</span>} rules={[{ required: true }]}>
                            <Input placeholder="Pincode" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>Shipping Address</Text>
                </div>

                <Form.List name="shippingAddress">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className={styles.shippingAddressCard}>
                                    {!readOnly && (
                                        <DeleteOutlined className={styles.removeAddressBtn} onClick={() => remove(name)} />
                                    )}
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <Form.Item {...restField} name={[name, 'line1']} label={<span className={styles.formLabel}>Address Line 1</span>} rules={[{ required: true }]}>
                                                <Input placeholder="Address Line 1" disabled={readOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item {...restField} name={[name, 'line2']} label={<span className={styles.formLabel}>Address Line 2</span>}>
                                                <Input placeholder="Address Line 2" disabled={readOnly} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'locality']} label={<span className={styles.formLabel}>Locality</span>} rules={[{ required: true }]}>
                                                <Input placeholder="Locality" disabled={readOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'pincode']} label={<span className={styles.formLabel}>Pincode</span>} rules={[{ required: true }]}>
                                                <Input placeholder="Pincode" disabled={readOnly} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'branchId']} label={<span className={styles.formLabel}>Link Branch</span>}>
                                                <Select placeholder="Select Branch" disabled={readOnly} allowClear style={{ width: '100%' }}>
                                                    {branches.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'countryId']} label={<span className={styles.formLabel}>Country</span>}>
                                                <Select placeholder="Select" disabled={readOnly} allowClear onChange={(v) => handleCountryChange(v, name)}>
                                                    {countries.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'stateId']} label={<span className={styles.formLabel}>State</span>}>
                                                <Select placeholder="Select" disabled={readOnly} allowClear onChange={(v) => handleStateChange(v, name)}>
                                                    {states.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item {...restField} name={[name, 'cityId']} label={<span className={styles.formLabel}>City</span>}>
                                                <Select placeholder="Select" disabled={readOnly} allowClear>
                                                    {cities.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {!readOnly && (
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className={styles.addAddressBtn}>
                                    Add Shipping Address
                                </Button>
                            )}
                        </>
                    )}
                </Form.List>

                <div className={styles.sectionHeader} style={{ marginTop: 24 }}>
                    <Text className={styles.sectionTitle}>Other Information</Text>
                </div>

                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item name="remarks" label={<span className={styles.formLabel}>Remarks</span>}>
                            <Input.TextArea placeholder="Enter Remarks" rows={3} disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default DealerMasterModal;
