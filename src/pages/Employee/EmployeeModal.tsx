import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Typography, Divider, message, Button } from 'antd';
import dayjs from 'dayjs';
import { getDepartments } from '../../api/department';
import { getBranches } from '../../api/branch';
import styles from './Employee.module.css';

const { Option } = Select;
const { Title } = Typography;

interface EmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [departments, setDepartments] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, branchRes] = await Promise.all([getDepartments(), getBranches()]);
                setDepartments(deptRes.data?.departments || []);
                setBranches(branchRes.data?.branches || []);
            } catch (error) {
                message.error('Failed to fetch departments or branches');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                const formattedValues = {
                    ...initialValues,
                    ...initialValues.profile,
                    departmentId: initialValues.profile?.departmentId,
                    branchId: initialValues.profile?.branch?.map((b: any) => b.id) || [],
                    dateOfBirth: initialValues.profile?.dateOfBirth ? dayjs(initialValues.profile.dateOfBirth) : null,
                    dateOfJoining: initialValues.profile?.dateOfJoining ? dayjs(initialValues.profile.dateOfJoining) : null,
                    ifscCode: initialValues.profile?.bankDetails?.ifsc,
                    accountNumber: initialValues.profile?.bankDetails?.accountNumber,
                    accountHolder: initialValues.profile?.bankDetails?.accountName,
                    bankName: initialValues.profile?.bankDetails?.name,
                    status: initialValues.status ?? true
                };
                delete formattedValues.password;
                form.setFieldsValue(formattedValues);
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
            onSave(values);
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1200}
            confirmLoading={loading}
            title={<div className={styles.modalTitle}>{readOnly ? "View Employee" : "Employee"}</div>}
            okText="OK"
            cancelText="Cancel"
            centered
            footer={readOnly ? [
                <Button key="close" onClick={onClose}>Close</Button>
            ] : undefined}
        >
            <Form form={form} layout="vertical" className={styles.employeeForm}>
                <Title level={5} className={styles.sectionTitle}>Employee Details</Title>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="employeeName" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
                            <Input placeholder="Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="fatherName" label="Father's Name" rules={[{ required: true, message: "Please enter father's name" }]}>
                            <Input placeholder="Father's Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="dateOfBirth" label="DOB" rules={[{ required: true, message: 'Please select date of birth' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="phone2" label="Personal Mobile Number" rules={[{ required: true, message: 'Please enter personal mobile number' }]}>
                            <Input addonBefore="+91" placeholder="Alternate Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="phone" label="Mobile Number" rules={[{ required: true, message: 'Please enter mobile number' }]}>
                            <Input addonBefore="+91" placeholder="Mobile Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bloodGroup" label="Blood Group">
                            <Select placeholder="Blood Group" disabled={readOnly}>
                                <Option value="A+">A+</Option>
                                <Option value="A-">A-</Option>
                                <Option value="B+">B+</Option>
                                <Option value="B-">B-</Option>
                                <Option value="O+">O+</Option>
                                <Option value="O-">O-</Option>
                                <Option value="AB+">AB+</Option>
                                <Option value="AB-">AB-</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    {!readOnly && (
                        <Col span={8}>
                            <Form.Item name="password" label="Password" rules={[{ required: !initialValues, message: 'Please enter password' }]}>
                                <Input.Password placeholder="Password" />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={8}>
                        <Form.Item name="departmentId" label="Department" rules={[{ required: true, message: 'Please select department' }]}>
                            <Select placeholder="Select Department" disabled={readOnly}>
                                {departments.map(d => (
                                    <Option key={d.id} value={d.id}>{d.role}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="branchId" label="Branch" rules={[{ required: true, message: 'Please select branch' }]}>
                            <Select mode="multiple" placeholder="Select Branch" disabled={readOnly}>
                                {branches.map(b => (
                                    <Option key={b.id} value={b.id}>{b.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="aadhaarNumber" label="Aadhaar Number">
                            <Input placeholder="Aadhaar Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="panNumber" label="PAN Number">
                            <Input placeholder="PAN Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="drivingLicense" label="Driving License">
                            <Input placeholder="DRIVING LICENSE" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="dateOfJoining" label="Date of Joining" rules={[{ required: true, message: 'Please select date of joining' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status" label="Status" initialValue={true} rules={[{ required: true, message: 'Please select status' }]}>
                            <Select disabled={readOnly}>
                                <Option value={true}>Active</Option>
                                <Option value={false}>InActive</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />
                <Title level={5} className={styles.sectionTitle}>Account Details</Title>
                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="ifscCode" label="IFSC Code">
                            <Input placeholder="IFSC CODE" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="accountNumber" label="Account Number">
                            <Input placeholder="Account Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="accountHolder" label="Account Holder">
                            <Input placeholder="Account Holder" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="bankName" label="Bank">
                            <Input placeholder="Bank" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;
