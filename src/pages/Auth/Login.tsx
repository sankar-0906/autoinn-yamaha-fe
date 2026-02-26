import React, { useState } from 'react';
import { Form, Input, Button, Card, Checkbox, Typography, message } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import logo from '../../assets/logo.png';

import styles from './Login.module.css';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/login', {
                phone: values.phone,
                password: values.password,
            });

            if (response.data.data) {
                const { token, user } = response.data.data;
                await login(token, user);
                message.success('Login successful');
                navigate('/dashboard');
            } else {
                message.error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            message.error(error.response?.data?.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                    <Title level={4} className={styles.title}>Login</Title>
                </div>
                <Form
                    form={form}
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    initialValues={{ remember: true }}
                >
                    <Form.Item
                        name="phone"
                        rules={[{ required: true, message: 'Please input your phone number!' }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className={styles.submitBtn}
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
