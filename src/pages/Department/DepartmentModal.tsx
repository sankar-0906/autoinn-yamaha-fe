import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Button, Table, Space, Checkbox, message, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import submodulesData from '../../JSONFiles/submodule.json';
import styles from './Department.module.css';

const { Option } = Select;

interface RoleAccessRow {
    key: string;
    master: string;
    subModule: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    print: boolean;
}

interface RoleAccess {
    master: string;
    subModule: string;
    access: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        print: boolean;
    };
}

interface DepartmentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const accessFields: Array<keyof Omit<RoleAccessRow, 'key' | 'master' | 'subModule'>> = ['create', 'read', 'update', 'delete', 'print'];

const DepartmentModal: React.FC<DepartmentModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [roleRows, setRoleRows] = useState<RoleAccessRow[]>([]);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                const rows = (initialValues.roleAccess || []).map((ra: RoleAccess, index: number) => ({
                    key: index.toString(),
                    master: ra.master,
                    subModule: ra.subModule,
                    ...ra.access
                }));
                setRoleRows(rows);
            } else {
                form.resetFields();
                setRoleRows([]);
            }
        }
    }, [open, initialValues, form]);

    const handleAddRow = () => {
        const selectedModule = form.getFieldValue('tempModule');
        const selectedSubModule = form.getFieldValue('tempSubModule');

        if (!selectedModule || !selectedSubModule) {
            message.warning('Please select Module and Sub Module first');
            return;
        }

        const exists = roleRows.some(r => r.master === selectedModule && r.subModule === selectedSubModule);
        if (exists) {
            message.warning('This module/submodule is already added');
            return;
        }

        const newRow: RoleAccessRow = {
            key: Date.now().toString(),
            master: selectedModule,
            subModule: selectedSubModule,
            create: true,
            read: true,
            update: true,
            delete: true,
            print: true,
        };

        setRoleRows([...roleRows, newRow]);
        form.setFieldsValue({ tempModule: null, tempSubModule: null });
    };

    const handleAddAll = () => {
        if (readOnly) return; // Disable if readOnly
        const newRows: RoleAccessRow[] = submodulesData.submodules.map((sm, index) => ({
            key: `all-${index}-${Date.now()}`,
            master: sm.id,
            subModule: sm.title,
            create: true,
            read: true,
            update: true,
            delete: true,
            print: true,
        }));
        setRoleRows(newRows);
    };

    const handleRemoveRow = (key: string) => {
        if (readOnly) return; // Disable if readOnly
        setRoleRows(roleRows.filter(r => r.key !== key));
    };

    const toggleAccess = (key: string, field: string) => {
        if (readOnly) return; // Disable if readOnly
        setRoleRows(roleRows.map(r =>
            r.key === key ? { ...r, [field]: !r[field as keyof RoleAccessRow] } : r
        ));
    };

    const handleOk = async () => {
        if (readOnly) { // If readOnly, just close the modal
            onClose();
            return;
        }
        try {
            const values = await form.validateFields();

            if (roleRows.length === 0) {
                message.error('Please add at least one module access');
                return;
            }

            const roleAccess = roleRows.map(r => ({
                master: r.master,
                subModule: r.subModule,
                access: {
                    create: r.create,
                    read: r.read,
                    update: r.update,
                    delete: r.delete,
                    print: r.print,
                }
            }));

            const { tempModule, tempSubModule, ...finalValues } = values;
            onSave({ ...finalValues, roleAccess });
        } catch (err) {
            // Error handling is managed by Form.Item rules
        }
    };

    const columns = [
        {
            title: 'Module',
            dataIndex: 'master',
            render: (v: string) => v.replace(/_/g, ' ')
        },
        {
            title: 'Sub Module',
            dataIndex: 'subModule'
        },
        {
            title: 'CRUD Access Rights',
            render: (_: any, record: RoleAccessRow) => (
                <Space size={12}>
                    {accessFields.map(f => (
                        <label key={f} className={styles.accessLabel}>
                            <Checkbox
                                checked={record[f] as boolean}
                                onChange={() => toggleAccess(record.key, f)}
                                disabled={readOnly} // Disable checkbox if readOnly
                            />
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </label>
                    ))}
                </Space>
            )
        },
        {
            title: 'Action',
            render: (_: any, record: RoleAccessRow) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveRow(record.key)}
                    className={styles.actionBtn}
                    disabled={readOnly} // Disable button if readOnly
                >
                    Remove
                </Button>
            )
        }
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={"1200px"}
            confirmLoading={loading}
            title={<div className={styles.modalTitle}>{readOnly ? "View Department" : "Department"}</div>}
            okText="OK"
            cancelText="Cancel"
            destroyOnHidden
            closable={false}
            footer={readOnly ? [ // Hide OK button if readOnly
                <Button key="close" onClick={onClose}>Close</Button>
            ] : undefined}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="role"
                            label="Department Name"
                            rules={[
                                { required: true, message: 'Enter Department Name' },
                                { whitespace: true, message: 'Enter Department Name' },
                                {
                                    pattern: /^[A-Za-z][a-zA-Z\s]*[a-zA-Z]+$/,
                                    message: 'Enter Valid Department Name'
                                }
                            ]}
                        >
                            <Input placeholder="Department Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="departmentType" label="Department Type" rules={[{ required: true, message: 'Please select department type' }]}>
                            <Select mode="multiple" placeholder="Select Type" disabled={readOnly}>
                                {['SALES', 'SERVICE', 'SPARES', 'GENERAL']
                                    .filter(t => !(form.getFieldValue('departmentType') || []).includes(t))
                                    .map(t => (
                                        <Option key={t} value={t}>{t}</Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="othersAccess"
                    label="Manager"
                    required
                    rules={[{ required: true, message: 'Please select Manager' }]}
                >
                    <Radio.Group disabled={readOnly}>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                    </Radio.Group>
                </Form.Item>

                <div className={styles.roleAccessSection}>
                    {!readOnly && ( // Hide this section if readOnly
                        <Row gutter={16} align="bottom">
                            <Col span={6}>
                                <Form.Item
                                    name="tempModule"
                                    label="Select Module"
                                    style={{ marginBottom: 0 }}
                                    required
                                    rules={[{ required: true, message: 'Please select Module' }]}
                                >
                                    <Select
                                        placeholder="Select Module"
                                        allowClear
                                        onChange={() => form.setFieldsValue({ tempSubModule: null })}
                                    >
                                        {submodulesData.modules.map(m => (
                                            <Option key={m.key} value={m.key}>{m.title}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="tempSubModule"
                                    label="Select Sub Module"
                                    style={{ marginBottom: 0 }}
                                    required
                                    rules={[{ required: true, message: 'Please select Sub Module' }]}
                                >
                                    <Select
                                        placeholder="Select Sub Module"
                                        allowClear
                                    >
                                        {submodulesData.submodules
                                            .filter(sm => sm.id === form.getFieldValue('tempModule'))
                                            .filter(sm => !roleRows.some(r => r.master === form.getFieldValue('tempModule') && r.subModule === sm.title))
                                            .map(sm => (
                                                <Option key={sm.key} value={sm.title}>{sm.title}</Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Space>
                                    <Button className={styles.addBtn} type="primary" onClick={handleAddRow}>Add Row</Button>
                                    <Button className={styles.addBtn} type="primary" onClick={handleAddAll}>Add All Modules</Button>
                                </Space>
                            </Col>
                        </Row>
                    )}

                    <Table
                        dataSource={roleRows}
                        columns={[
                            { ...columns[0], width: 150 },
                            { ...columns[1], width: 180 },
                            { ...columns[2], width: 550 },
                            { ...columns[3], width: 120 }
                        ]}
                        pagination={false}
                        className={styles.roleTable}
                        style={{ marginTop: 24 }}
                        scroll={{ y: 300, x: 1000 }}
                        size="small"
                        rowKey="key"
                    />
                </div>
            </Form>
        </Modal>
    );
};

export default DepartmentModal;
