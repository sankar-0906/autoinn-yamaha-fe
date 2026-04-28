import React, { useState, useEffect } from 'react';
import {
    Modal, Input, Form, Row, Col, Typography,
} from 'antd';

const { Text, Title } = Typography;

const HSNForm = (props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editable, setEditable] = useState(props.editable);
    const [error, setError] = useState({});

    const { open, close, data, modify } = props;

    useEffect(() => {
        setEditable(props.editable);
        if (data) {
            form.setFieldsValue({
                code: data.code,
                description: data.description,
                cess: data.cess,
                cgst: data.cgst,
                sgst: data.sgst,
                igst: data.igst,
            });
        } else {
            form.resetFields();
        }
    }, [data, props.editable, open]);

    const calculateGST = (e) => {
        const igstStr = e.target.value;
        const igstNum = parseFloat(igstStr);
        if (!isNaN(igstNum)) {
            form.setFieldsValue({
                cgst: igstNum / 2,
                sgst: igstNum / 2,
            });
        } else {
            form.setFieldsValue({
                cgst: 0,
                sgst: 0,
            });
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (Object.keys(error).length > 0) return;

            setLoading(true);
            const payload = {
                ...values,
                id: data?.id,
            };

            await props.emitData(payload);
            setLoading(false);
            form.resetFields();
            close();
        } catch (err) {
            console.error('Validation failed:', err);
        }
    };

    return (
        <Modal
            title={<Title level={4}>HSN Code</Title>}
            open={open}
            okText={editable ? 'Save' : 'Modify'}
            onCancel={() => {
                form.resetFields();
                setError({});
                close();
            }}
            okButtonProps={{ loading, disabled: (!editable && !modify) }}
            onOk={() => (editable ? handleSubmit() : setEditable(true))}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="code"
                            label="HSN Code"
                            rules={[{ required: true, message: 'Enter HSN code' }]}
                            validateStatus={error.HSN && 'error'}
                            help={error.HSN && error.HSN.message}
                        >
                            <Input
                                disabled={!editable}
                                placeholder="HSN code"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && !/^[0-9]*$/.test(val)) {
                                        setError({ ...error, HSN: { message: 'Enter digits only' } });
                                    } else {
                                        const newErr = { ...error };
                                        delete newErr.HSN;
                                        setError(newErr);
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="igst"
                            label="IGST (%)"
                            rules={[
                                { required: true, message: 'Enter IGST' },
                                {
                                    validator(_, value) {
                                        if (value !== undefined && value !== null && value !== '' && Number(value) < 0) {
                                            return Promise.reject(new Error('Negative values are not allowed'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input
                                type="number"
                                addonAfter="%"
                                onChange={(e) => {
                                    calculateGST(e);
                                }}
                                disabled={!editable}
                                placeholder="IGST"
                                min={0}
                                onKeyPress={(e) => {
                                    const char = String.fromCharCode(e.which);
                                    if (!/[0-9]/.test(char) && char !== '.') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <Input
                                disabled={!editable}
                                placeholder="Description"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="cgst"
                            label="CGST (%)"
                        >
                            <Input
                                disabled
                                addonAfter="%"
                                placeholder="CGST"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="cess"
                            label="CESS (%)"
                            rules={[
                                {
                                    validator(_, value) {
                                        if (value !== undefined && value !== null && value !== '' && Number(value) < 0) {
                                            return Promise.reject(new Error('Negative values are not allowed'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input
                                type="number"
                                addonAfter="%"
                                disabled={!editable}
                                placeholder="Cess"
                                min={0}
                                onKeyPress={(e) => {
                                    const char = String.fromCharCode(e.which);
                                    if (!/[0-9]/.test(char) && char !== '.') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="sgst"
                            label="SGST (%)"
                        >
                            <Input
                                disabled
                                addonAfter="%"
                                placeholder="SGST"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default HSNForm;
