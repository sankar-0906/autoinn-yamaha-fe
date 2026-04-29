import React, { useState, useEffect } from 'react';
import { Tabs, Card, Row, Col, Typography, Form, Input, Button, message, Spin } from 'antd';
import {
    BankOutlined,
    SettingOutlined,
    DeploymentUnitOutlined,
    UserOutlined,
    ToolOutlined,
    CarOutlined,
    TagOutlined,
    BuildOutlined,
    NumberOutlined,
    FileTextOutlined,
    ShopOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import companyModules from '../../JSONFiles/companyModules.json';
// @ts-ignore
import BranchPage from '../../components/CompanyMasters/Company/Branch';

import styles from './CompanySettings.module.css';

const { Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
    department: <DeploymentUnitOutlined />,
    employee: <UserOutlined />,
    manufacturer: <ToolOutlined />,
    vehicle_master: <CarOutlined />,
    parts_master: <BuildOutlined />,
    VehiclePrice: <TagOutlined />,
    hsn_code: <NumberOutlined />,
    sac: <FileTextOutlined />,
    financier: <DollarOutlined />,
    dealer_master: <ShopOutlined />,
    idgenerator: <SettingOutlined />,
    frame_number: <NumberOutlined />,
    branch: <ShopOutlined />,
};

const CompanySettings: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/company');
            const companyData = res.data?.data?.[0] || res.data?.data;
            if (companyData) {
                setCompany(companyData);
                form.setFieldsValue(companyData);
            }
        } catch (error: any) {
            message.error('Failed to fetch company details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: any) => {
        if (!company?.id) return;
        setSaving(true);
        try {
            await axiosInstance.put(`/company/${company.id}`, values);
            message.success('Company updated successfully');
            await fetchCompany();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const companyMasterSubmodules = companyModules.modules.filter(sub => {
        if (!user?.profile?.department?.roleAccess) return false;
        const access = user.profile.department.roleAccess.find(
            ra => ra.master === 'COMPANYMASTER' && ra.subModule.toLowerCase() === sub.key.toLowerCase()
        );
        return access?.access?.read !== false;
    });

    const renderCard = (sub: any) => (
        <Col xs={24} sm={12} md={8} lg={6} key={sub.key}>
            <Card
                hoverable
                className={styles.masterCard}
                onClick={() => navigate(`/company/${sub.key}`)}
            >
                <div className={styles.masterIcon}>
                    {iconMap[sub.key] || <SettingOutlined />}
                </div>
                <Text strong>{sub.title}</Text>
            </Card>
        </Col>
    );

    return (
        <div className={styles.pageContainer}>
            <Tabs
                defaultActiveKey="1"
                className={styles.tabsContainer}
                items={[
                    {
                        key: '1',
                        label: (
                            <span>
                                <BankOutlined />
                                Company
                            </span>
                        ),
                        children: (
                            <div className={styles.tabContent}>
                                <Spin spinning={loading}>
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={handleSave}
                                        className={styles.formContainer}
                                    >
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                                                    <Input placeholder="Enter Company Name" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="email"
                                                    label="Email"
                                                    rules={[
                                                        { required: true, message: 'Enter email' },
                                                        { type: 'email', message: 'Invalid email format' }
                                                    ]}
                                                >
                                                    <Input placeholder="Enter Email" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="website" label="Website">
                                                    <Input placeholder="Enter Website" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="phone"
                                                    label="Phone"
                                                    rules={[
                                                        { required: true, message: 'Enter phone number' },
                                                        { pattern: /^\d{10}$/, message: 'Enter valid phone number' }
                                                    ]}
                                                    normalize={(value) => (value || '').replace(/[^0-9]/g, '')}
                                                >
                                                    <Input placeholder="Enter Phone" maxLength={10} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={saving} className={styles.saveBtn}>
                                                Save Settings
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Spin>
                            </div>
                        ),
                    },
                    {
                        key: '2',
                        label: (
                            <span>
                                <ShopOutlined />
                                Company Branch
                            </span>
                        ),
                        children: (
                            <div className={styles.tabContent}>
                                <BranchPage isTab={true} />
                            </div>
                        ),
                    },
                    {
                        key: '3',
                        label: (
                            <span>
                                <SettingOutlined />
                                Company Master
                            </span>
                        ),
                        children: (
                            <div className={styles.tabContent}>
                                <Row gutter={16}>
                                    {companyMasterSubmodules.map(renderCard)}
                                </Row>
                            </div>
                        ),
                    },
                ]}
            />
        </div >
    );
};

export default CompanySettings;
