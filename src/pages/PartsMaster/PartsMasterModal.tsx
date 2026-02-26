import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, Checkbox, DatePicker, message, InputNumber, Space } from 'antd';
import { getManufacturers } from '../../api/manufacturer';
import { getVehicles } from '../../api/vehicleMaster';
import styles from './PartsMaster.module.css';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface PartsMasterModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const PartsMasterModal: React.FC<PartsMasterModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, vRes] = await Promise.all([
                    getManufacturers(),
                    getVehicles()
                ]);
                setManufacturers(mRes.data?.data || mRes.data || []);
                setVehicles(vRes.data?.data || vRes.data || []);
            } catch (error) {
                message.error('Failed to fetch dependency data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Ensure date and relations are handled
                const values = {
                    ...initialValues,
                    wefDate: initialValues.wefDate ? dayjs(initialValues.wefDate) : null,
                    vehicleSuit: initialValues.vehicleSuit?.map((item: any) => item.vehicleId) || []
                };
                form.setFieldsValue(values);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            const { vehicleSuit, ...rest } = values;
            // Convert back to backend format: "vehicleSuit":[{"id":"","vehicle":"..."}]
            const submitData = {
                ...rest,
                wefDate: rest.wefDate ? rest.wefDate.toISOString() : null,
                vehicleSuit: vehicleSuit ? vehicleSuit.map((vid: string) => ({
                    id: "",
                    vehicle: vid
                })) : []
            };
            onSave(submitData);
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
                    <Title level={4} className={styles.modalTitle}>Parts Master</Title>
                </div>
            }
            footer={readOnly ? [
                <Button key="close" onClick={onClose}>Close</Button>
            ] : [
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} className={styles.addBtn}>
                    {initialValues?.id && !initialValues.isClone ? 'Update' : 'Save'}
                </Button>
            ]}
            centered
            bodyStyle={{ padding: '24px' }}
        >
            <Form form={form} layout="vertical">

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="partNumber" label={<span className={styles.formLabel}>Part No</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Part No" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="oldPartNum" label={<span className={styles.formLabel}>Old Part No</span>}>
                            <Input placeholder="Old Part No" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="partName" label={<span className={styles.formLabel}>Part Name</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Part Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="category" label={<span className={styles.formLabel}>Category</span>}>
                            <Input placeholder="Category" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="largeCategoryName" label={<span className={styles.formLabel}>Large Category Name</span>}>
                            <Input placeholder="Large Category Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="size" label={<span className={styles.formLabel}>Size</span>}>
                            <Input placeholder="Enter Size" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="mainPartNumber" label={<span className={styles.formLabel}>Main Part No.</span>}>
                            <Input placeholder="Enter Main Part Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="displayName" label={<span className={styles.formLabel}>Display name</span>}>
                            <Input placeholder="Enter Display Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="moq" label={<span className={styles.formLabel}>MOQ</span>}>
                            <InputNumber placeholder="Minimum Order Quantity" style={{ width: '100%' }} disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="manufacturerId" label={<span className={styles.formLabel}>Manufacturer</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Manufacturer" disabled={readOnly} allowClear>
                                {manufacturers.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="vehicleSuit"
                            label={<span className={styles.formLabel}>Vehicle Model :</span>}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Vehicle Models"
                                disabled={readOnly}
                                style={{ width: '100%' }}
                                allowClear
                                optionFilterProp="children"
                            >
                                {vehicles.map(v => (
                                    <Option key={v.id} value={v.id}>
                                        {v.modelCode ? `${v.modelCode} - ${v.modelName}` : v.modelName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="color" label={<span className={styles.formLabel}>Color</span>}>
                            <Input placeholder="Color" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="partStatus" label={<span className={styles.formLabel}>Part Status</span>}>
                            <Select placeholder="Select Status" disabled={readOnly} allowClear>
                                <Option value="Available">Available</Option>
                                <Option value="Unavailable">Unavailable</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Space size="large">
                            <Form.Item name="showInConsumer" valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Checkbox disabled={readOnly}>Show in Consumer</Checkbox>
                            </Form.Item>
                            <Form.Item name="showInAutoCloud" valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Checkbox disabled={readOnly}>Show in AutoCloud</Checkbox>
                            </Form.Item>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default PartsMasterModal;
