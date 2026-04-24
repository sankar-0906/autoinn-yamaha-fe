import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button } from 'antd';
import styles from './FrameNumber.module.css';
import { getManufacturers } from '../../api/manufacturer';

const { Title } = Typography;
const { Option } = Select;

interface FrameNumberModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
}

const FrameNumberModal: React.FC<FrameNumberModalProps> = ({ open, onClose, onSave, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [manufacturers, setManufacturers] = useState<any[]>([]);

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const res = await getManufacturers();
                setManufacturers(res.data?.data || res.data || []);
            } catch (err) {
                console.error('Failed to fetch manufacturers', err);
            }
        };
        fetchManufacturers();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            onSave(values);
        });
    };

    const inferredField = Form.useWatch('inferredField', form);

    const targetValueOptions = inferredField === 'Month'
        ? ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
        : Array.from({ length: 31 }, (_, i) => (2000 + i).toString());

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={700}
            confirmLoading={loading}
            title={
                <div className={styles.modalHeader}>
                    <Title level={4} className={styles.modalTitle}>Frame Number Rule</Title>
                </div>
            }
            footer={[
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} className={styles.addBtn}>
                    Save
                </Button>
            ]}
            centered
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="manufacturerId" label={<span className={styles.formLabel}>Manufacturer</span>} rules={[{ required: true, message: 'Please select manufacturer' }]}>
                            <Select placeholder="Select Manufacturer" showSearch filterOption={(input, option) => (option?.children as any).toLowerCase().includes(input.toLowerCase())}>
                                {manufacturers.map(m => (
                                    <Option key={m.id} value={m.id}>{m.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label={<span className={styles.formLabel}>Position</span>} rules={[{ required: true, message: 'Please select position' }]}>
                            <Select placeholder="Select Position">
                                <Option value={9}>9</Option>
                                <Option value={10}>10</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="inputValue" label={<span className={styles.formLabel}>Input Value</span>} rules={[{ required: true, message: 'Please enter input value' }, { len: 1, message: 'Max 1 character' }]}>
                            <Input placeholder="e.g. A" maxLength={1} onChange={e => form.setFieldsValue({ inputValue: e.target.value.toUpperCase() })} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="inferredField" label={<span className={styles.formLabel}>Inferred Field</span>} rules={[{ required: true, message: 'Please select inferred field' }]}>
                            <Select placeholder="Select Inferred Field" onChange={() => form.setFieldsValue({ targetValue: undefined })}>
                                <Option value="Month">Month</Option>
                                <Option value="Year">Year</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item name="targetValue" label={<span className={styles.formLabel}>Target Value (Result)</span>} rules={[{ required: true, message: 'Please select target value' }]}>
                            <Select placeholder="Select Target Value" showSearch disabled={!inferredField}>
                                {targetValueOptions.map(opt => (
                                    <Option key={opt} value={opt}>{opt}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default FrameNumberModal;
