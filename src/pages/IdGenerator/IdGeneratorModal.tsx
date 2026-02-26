import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, Radio } from 'antd';
import styles from './IdGenerator.module.css';

const { Title } = Typography;
const { Option } = Select;

interface IdGeneratorModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
}

const IdGeneratorModal: React.FC<IdGeneratorModalProps> = ({ open, onClose, onSave, initialValues, loading }) => {
    const [form] = Form.useForm();

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
            const data = { ...values };
            if (!initialValues) {
                // While creating, send count as both startCount and count
                data.startCount = values.count;
            }
            onSave(data);
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
                    <Title level={4} className={styles.modalTitle}>ID Generator</Title>
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
                        <Form.Item name="module" label={<span className={styles.formLabel}>Module</span>} rules={[{ required: true }]}>
                            <Select placeholder="Select Module">
                                <Option value="Transaction Master">Transaction Master</Option>
                                <Option value="Company Master">Company Master</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="subModule" label={<span className={styles.formLabel}>Sub Module</span>} rules={[{ required: true }]}>
                            <Select placeholder="Select Sub Module">
                                <Option value="Customer Details">Customer Details</Option>
                                <Option value="Employee">Employee</Option>
                                <Option value="Job Order">Job Order</Option>
                                <Option value="Quotations">Quotations</Option>
                                <Option value="Vehicle Purchase Invoice">Vehicle Purchase Invoice</Option>
                                <Option value="Spare Purchase Invoice">Spare Purchase Invoice</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="text" label={<span className={styles.formLabel}>Static text parameter</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. CNB" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="count" label={<span className={styles.formLabel}>Upcoming ID</span>}>
                            <Input placeholder="Enter count" readOnly={!!initialValues} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="scope" label={<span className={styles.formLabel}>Scope of ID</span>} rules={[{ required: true }]}>
                            <Select placeholder="Select Scope">
                                <Option value="Company level">Company level</Option>
                                <Option value="Branch level">Branch level</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="resetAnnually" label={<span className={styles.formLabel}>Reset ID annually</span>}>
                    <Radio.Group>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default IdGeneratorModal;
