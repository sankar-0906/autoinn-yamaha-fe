import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form, Input, Select, Button, Table, message, Space, Typography, Steps, Row, Col, Card
} from 'antd';
import {
    BankOutlined, ApartmentOutlined, UserOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import BranchModal from './components/BranchModal';
import {
    createCompany,
    createDepartment,
    createEmployee,
} from '../../api/onboarding';
import submodulesData from '../../JSONFiles/submodule.json';
import styles from './GetStarted.module.css';

const { Title, Text } = Typography;

const GetStarted: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form instances
    const [companyForm] = Form.useForm();
    const [adminForm] = Form.useForm();

    // Data states
    const [branches, setBranches] = useState<any[]>([]);
    const [branchModalVisible, setBranchModalVisible] = useState(false);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [masterAdminDeptId, setMasterAdminDeptId] = useState<string | null>(null);

    const handleCompanyNext = async () => {
        try {
            const values = await companyForm.validateFields();
            if (branches.length === 0) {
                message.warning('Please add at least one branch.');
                return;
            }
            setLoading(true);
            const res = await createCompany({ ...values, branches });
            setCompanyId(res.data.data.id);
            setBranches(res.data.data.branches);
            setCurrentStep(1);
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Company setup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMasterAdmin = async () => {
        setLoading(true);
        try {
            const fullAccess = submodulesData.submodules.map(sm => ({
                master: sm.id,
                subModule: sm.title,
                access: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    print: true
                }
            }));

            const res = await createDepartment({
                role: 'Master Admin',
                departmentType: ['GENERAL', 'SALES', 'SERVICE', 'SPARES'],
                othersAccess: true,
                companyId: companyId,
                roleAccess: fullAccess
            });

            setMasterAdminDeptId(res.data.data.id);
            setCurrentStep(2);
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Role creation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        try {
            const values = await adminForm.validateFields();
            setLoading(true);
            const res = await createEmployee({
                ...values,
                departmentId: masterAdminDeptId,
                employee: true,
                status: true
            });

            if (res.data.success) {
                message.success('Onboarding complete! Please login.');
                navigate('/login');
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Admin account creation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBranch = (branch: any) => {
        setBranches([...branches, { ...branch, id: Date.now().toString() }]);
    };

    const handleDeleteBranch = (id: string) => {
        setBranches(branches.filter(b => b.id !== id));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className={styles.stepContent}>
                        <Title level={3} className={styles.stepTitle}>Company Profile</Title>
                        <Text className={styles.stepDescription}>Tell us about your organization to get started.</Text>

                        <Form form={companyForm} layout="vertical">
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item name="name" label="Company Name" rules={[{ required: true, message: 'Enter your company name' }]}>
                                        <Input placeholder="e.g. Yamaha Central Depot" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="email" label="Official Email" rules={[{ type: 'email', required: true }]}>
                                        <Input placeholder="office@yamaha.com" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Main Contact Number" rules={[{ required: true }]}>
                                        <Input placeholder="+91..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>

                        <div className={styles.roleAccessSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                <Text strong style={{ color: 'white' }}>Branches & Locations</Text>
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => setBranchModalVisible(true)}
                                    ghost
                                >
                                    Add Branch
                                </Button>
                            </div>
                            <Table
                                dataSource={branches}
                                size="small"
                                pagination={false}
                                rowKey="id"
                                className={styles.branchTable}
                                columns={[
                                    { title: 'Branch Name', dataIndex: 'name' },
                                    { title: 'GST', dataIndex: 'gst' },
                                    {
                                        title: 'Action',
                                        align: 'right',
                                        render: (_, record) => (
                                            <Button
                                                size="small"
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteBranch(record.id)}
                                            />
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className={styles.stepContent} style={{ textAlign: 'center' }}>
                        <div style={{ padding: '40px 0' }}>
                            <CheckCircleOutlined style={{ fontSize: '64px', color: '#4ade80', marginBottom: '24px' }} />
                            <Title level={3} className={styles.stepTitle}>Company Created!</Title>
                            <Text className={styles.stepDescription}>Now we will set up the "Master Admin" role with full system access.</Text>

                            <Card className={styles.roleAccessSection} style={{ textAlign: 'left', marginTop: '24px' }}>
                                <Title level={5} style={{ color: 'white' }}>Role: Master Admin</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    This role grants complete ownership of the system, including:
                                </Text>
                                <ul style={{ color: 'rgba(255,255,255,0.85)', marginTop: '16px', paddingLeft: '20px' }}>
                                    <li>Full User & Department Management</li>
                                    <li>System Settings & Branch Configuration</li>
                                    <li>Financial Controls & Transaction Audit</li>
                                    <li>Inventory & Spare Parts Authority</li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.stepContent}>
                        <Title level={3} className={styles.stepTitle}>Primary Administrator</Title>
                        <Text className={styles.stepDescription}>Create the first user who will manage the system.</Text>

                        <div className={styles.adminCard}>
                            <Form form={adminForm} layout="vertical">
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item name="employeeName" label="Admin Full Name" rules={[{ required: true }]}>
                                            <Input placeholder="John Doe" prefix={<UserOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="phone" label="Mobile (Username)" rules={[{ required: true, len: 10, message: '10 digit mobile required' }]}>
                                            <Input placeholder="10-digit mobile" addonBefore="+91" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="password" label="Login Password" rules={[{ required: true, min: 6 }]}>
                                            <Input.Password placeholder="Min 6 characters" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="branchId" label="Primary Home Branch" rules={[{ required: true }]}>
                                            <Select placeholder="Select primary branch">
                                                {branches.map(b => (
                                                    <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(26, 138, 122, 0.1)', border: '1px solid rgba(26, 138, 122, 0.3)', borderRadius: '8px' }}>
                                    <Text style={{ color: '#4ade80' }}>
                                        <CheckCircleOutlined /> This user will be automatically assigned the <strong>Master Admin</strong> role.
                                    </Text>
                                </div>
                            </Form>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const stepItems = [
        { title: 'Identity', icon: <BankOutlined /> },
        { title: 'Privileges', icon: <ApartmentOutlined /> },
        { title: 'Administrator', icon: <UserOutlined /> }
    ];

    return (
        <div className={styles.getStartedPage}>
            <div className={styles.wizardContainer}>
                <div className={styles.stepsWrapper}>
                    <Steps current={currentStep} items={stepItems} responsive={false} />
                </div>

                {renderStepContent()}

                <div className={styles.footer}>
                    {currentStep === 0 && (
                        <Button type="primary" loading={loading} className={styles.primaryBtn} onClick={handleCompanyNext}>
                            Next: Setup Access
                        </Button>
                    )}
                    {currentStep === 1 && (
                        <Space>
                            <Button className={styles.secondaryBtn} onClick={() => setCurrentStep(0)}>Back</Button>
                            <Button type="primary" loading={loading} className={styles.primaryBtn} onClick={handleCreateMasterAdmin}>
                                Create Root Privileges
                            </Button>
                        </Space>
                    )}
                    {currentStep === 2 && (
                        <Space>
                            <Button className={styles.secondaryBtn} onClick={() => setCurrentStep(1)}>Back</Button>
                            <Button type="primary" loading={loading} className={styles.primaryBtn} onClick={handleFinish}>
                                Finish & Launch System
                            </Button>
                        </Space>
                    )}
                </div>
            </div>

            <BranchModal
                open={branchModalVisible}
                onClose={() => setBranchModalVisible(false)}
                onAdd={handleAddBranch}
            />
        </div>
    );
};

export default GetStarted;