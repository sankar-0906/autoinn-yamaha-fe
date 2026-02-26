import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, InputNumber } from 'antd';
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
                        <Form.Item name="manufacturerId" label={<span className={styles.formLabel}>Manufacturer</span>} rules={[{ required: true }]}>
                            <Select placeholder="Select Manufacturer">
                                {manufacturers.map(m => (
                                    <Option key={m.id} value={m.id}>{m.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="position" label={<span className={styles.formLabel}>Position</span>} rules={[{ required: true }]}>
                            <InputNumber placeholder="e.g. 10" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="inputValue" label={<span className={styles.formLabel}>Input Value</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. A" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="inferredField" label={<span className={styles.formLabel}>Inferred Field</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. Year" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item name="targetValue" label={<span className={styles.formLabel}>Target Value (Result)</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. 2024" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default FrameNumberModal;
