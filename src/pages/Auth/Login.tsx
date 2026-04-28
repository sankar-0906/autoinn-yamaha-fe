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
            console.log('Attempting login with:', values.phone);
            const response = await axiosInstance.post('/auth/login', {
                phone: values.phone,
                password: values.password,
            });

            console.log('Login response:', response.data);

            if (response.data.data) {
                const { token, user } = response.data.data;
                await login(token, user);
                message.success('Login successful');
                navigate('/dashboard');
            } else {
                console.log('Login failed - no data in response');
                message.error(response.data.message || 'Invalid Phone No or Password');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response);
            let errorMessage = 'Invalid Phone No or Password';
            
            if (error.response) {
                console.log('Error status:', error.response.status);
                if (error.response.status === 401) {
                    errorMessage = 'Invalid Phone No or Password';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.message || 'Invalid request';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again later';
                } else {
                    errorMessage = error.response.data?.message || 'Invalid Phone No or Password';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection';
            }
            
            console.log('Showing error message:', errorMessage);
            message.error(errorMessage);
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
                        rules={[
                            { required: true, message: 'Please input your phone number!' },
                            { pattern: /^[6-9]\d{9}$/, message: 'Please enter a valid phone number' }
                        ]}
                        normalize={(value) => {
                            const cleaned = (value || '').replace(/\D/g, '');
                            return cleaned.slice(0, 10);
                        }}
                    >
                        <Input 
                            prefix={<PhoneOutlined />} 
                            placeholder="Phone Number" 
                            maxLength={10}
                            onKeyPress={(e) => {
                                const char = String.fromCharCode(e.which);
                                if (!/[0-9]/.test(char)) {
                                    e.preventDefault();
                                }
                            }}
                        />
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
