import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Input, Select, Divider, Table, Button, Popconfirm, Tabs, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Text } = Typography;

const BankStep = ({ form, data, setData, editable }) => {
    const [error, setError] = useState({});
    const [deletedBanks, setDeletedBanks] = useState([]);

    useEffect(() => {
        // Only initialize if no bank details exist AND we're in a new branch creation mode
        if (!data.bankDetails || data.bankDetails.length === 0) {
            // Don't auto-initialize with empty bank details
            // Let the user add bank details manually if needed
            // This prevents validation errors for empty required fields
        }
    }, []);

    const validateBankField = (index, field, value, pattern, errorMessage) => {
        if (value && pattern && !pattern.test(value)) {
            setError({ 
                ...error, 
                [`Account ${index + 1}`]: { 
                    ...error[`Account ${index + 1}`], 
                    [field]: { type: 'error', message: errorMessage } 
                } 
            });
        } else {
            if (error[`Account ${index + 1}`]) {
                delete error[`Account ${index + 1}`][field];
                setError({ ...error });
            }
        }
    };

    const handleAddBank = () => {
        const newBankDetails = [...(data.bankDetails || []), {
            id: '',
            name: '',
            accountName: '',
            accountNumber: '',
            ifsc: '',
            accountType: 'SAVINGS'
        }];
        setData({ ...data, bankDetails: newBankDetails });
    };

    const removeBank = (index) => {
        const bankToRemove = data.bankDetails[index];
        if (bankToRemove.id) {
            // Track bank IDs to be deleted from backend
            setDeletedBanks([...deletedBanks, bankToRemove.id]);
        }
        
        const newBankDetails = [...data.bankDetails];
        newBankDetails.splice(index, 1);
        
        // Remove errors for this account
        if (error[`Account ${index + 1}`]) {
            delete error[`Account ${index + 1}`];
            setError({ ...error });
        }
        
        setData({ ...data, bankDetails: newBankDetails });
    };

    const updateBankField = (index, field, value) => {
        const newBankDetails = [...data.bankDetails];
        newBankDetails[index][field] = value;
        setData({ ...data, bankDetails: newBankDetails });
        
        // Validate specific fields
        switch (field) {
            case 'name':
                validateBankField(index, 'BANK', value, /^[a-zA-Z.\s]*[a-zA-Z.]+$/, 'Enter a Valid Bank Name');
                break;
            case 'accountName':
                validateBankField(index, 'HOLDER', value, /^[a-zA-Z.\s]*[a-zA-Z.]+$/, 'Enter a Valid Account Name');
                break;
            case 'accountNumber':
                validateBankField(index, 'AN', value, /^[0-9]{9,18}$/, 'Enter a Valid Account Number');
                break;
            case 'ifsc':
                validateBankField(index, 'IFSC', value, /^[A-Z|a-z|0-9]{11}$/, 'Enter a Valid IFSC Code');
                break;
        }
    };

    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    const formatValue = (e, type) => {
        const value = e.target.value;
        switch (type) {
            case 'titleCase':
                return toTitleCase(value);
            case 'onlyNo':
                return value.replace(/[^0-9]/g, '');
            default:
                return value;
        }
    };

    const validateAllBanks = useCallback(() => {
        const newErrors = {};
        let hasError = false;

        data.bankDetails?.forEach((bank, index) => {
            const accountKey = `Account ${index + 1}`;
            
            // Validate bank name
            if (!bank.name || bank.name.trim() === '') {
                newErrors[accountKey] = { 
                    ...newErrors[accountKey], 
                    BANK: { type: 'error', message: 'Bank name is required' } 
                };
                hasError = true;
            } else {
                delete newErrors[accountKey]?.BANK;
            }

            // Validate account name
            if (!bank.accountName || bank.accountName.trim() === '') {
                newErrors[accountKey] = { 
                    ...newErrors[accountKey], 
                    ACCOUNT_NAME: { type: 'error', message: 'Account name is required' } 
                };
                hasError = true;
            } else {
                delete newErrors[accountKey]?.ACCOUNT_NAME;
            }

            // Validate account number
            if (!bank.accountNumber || bank.accountNumber.trim() === '') {
                newErrors[accountKey] = { 
                    ...newErrors[accountKey], 
                    ACCOUNT_NUMBER: { type: 'error', message: 'Account number is required' } 
                };
                hasError = true;
            } else {
                delete newErrors[accountKey]?.ACCOUNT_NUMBER;
            }

            // Validate IFSC code
            if (!bank.ifsc || bank.ifsc.trim() === '') {
                newErrors[accountKey] = { 
                    ...newErrors[accountKey], 
                    IFSC: { type: 'error', message: 'IFSC code is required' } 
                };
                hasError = true;
            } else {
                delete newErrors[accountKey]?.IFSC;
            }

            // Validate account type
            if (!bank.accountType || bank.accountType.trim() === '') {
                newErrors[accountKey] = { 
                    ...newErrors[accountKey], 
                    ACCOUNT_TYPE: { type: 'error', message: 'Account type is required' } 
                };
                hasError = true;
            } else {
                delete newErrors[accountKey]?.ACCOUNT_TYPE;
            }
        });
        
        setError(newErrors);
        return !hasError;
    }, [data.bankDetails]);

    // Expose validation function to parent
    useEffect(() => {
        if (data.onValidate) {
            data.onValidate(validateAllBanks);
        }
    }, [data.onValidate, validateAllBanks]);

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Bank Accounts</Text>
                {editable && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBank}>
                        Add Bank Account
                    </Button>
                )}
            </div>

            {data.bankDetails?.length > 0 ? (
                <Tabs 
                    type="card" 
                    tabPosition="left" 
                    style={{ height: '420px' }}
                    defaultActiveKey="0"
                >
                    {data.bankDetails.map((bank, index) => (
                        <TabPane tab={`Account ${index + 1}`} key={index}>
                            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '16px' }}>
                                <Form layout="vertical" disabled={!editable}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                label="Bank Name" 
                                                required
                                                validateStatus={error[`Account ${index + 1}`]?.BANK?.type}
                                                help={error[`Account ${index + 1}`]?.BANK?.message}
                                            >
                                                <Input
                                                    placeholder="Bank Name"
                                                    value={bank.name}
                                                    onChange={e => updateBankField(index, 'name', e.target.value)}
                                                    onKeyUp={(e) => updateBankField(index, 'name', formatValue(e, 'titleCase'))}
                                                    maxLength={100}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                label="Account Holder Name" 
                                                required
                                                validateStatus={error[`Account ${index + 1}`]?.HOLDER?.type}
                                                help={error[`Account ${index + 1}`]?.HOLDER?.message}
                                            >
                                                <Input
                                                    placeholder="Account Holder Name"
                                                    value={bank.accountName}
                                                    onChange={e => updateBankField(index, 'accountName', e.target.value)}
                                                    onKeyUp={(e) => updateBankField(index, 'accountName', formatValue(e, 'titleCase'))}
                                                    maxLength={100}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                label="Account Number" 
                                                required
                                                validateStatus={error[`Account ${index + 1}`]?.AN?.type}
                                                help={error[`Account ${index + 1}`]?.AN?.message}
                                            >
                                                <Input
                                                    placeholder="Account Number"
                                                    value={bank.accountNumber}
                                                    onChange={e => updateBankField(index, 'accountNumber', e.target.value)}
                                                    onKeyUp={(e) => updateBankField(index, 'accountNumber', formatValue(e, 'onlyNo'))}
                                                    maxLength={18}
                                                    minLength={9}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                label="IFSC Code" 
                                                required
                                                validateStatus={error[`Account ${index + 1}`]?.IFSC?.type}
                                                help={error[`Account ${index + 1}`]?.IFSC?.message}
                                            >
                                                <Input
                                                    placeholder="IFSC Code"
                                                    value={bank.ifsc}
                                                    onChange={e => updateBankField(index, 'ifsc', e.target.value)}
                                                    onKeyUp={(e) => updateBankField(index, 'ifsc', formatValue(e, 'uppercase'))}
                                                    maxLength={11}
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Account Type" required>
                                                <Select
                                                    value={bank.accountType}
                                                    onChange={val => updateBankField(index, 'accountType', val)}
                                                    placeholder="Select Account Type"
                                                >
                                                    <Select.Option value="SAVINGS">Savings</Select.Option>
                                                    <Select.Option value="CURRENT">Current</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {editable && data.bankDetails.length > 1 && (
                                        <Row justify="end" style={{ marginTop: '16px' }}>
                                            <Popconfirm 
                                                title="Delete this bank account?" 
                                                description="This action cannot be undone."
                                                onConfirm={() => removeBank(index)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button danger icon={<DeleteOutlined />}>
                                                    Remove Account
                                                </Button>
                                            </Popconfirm>
                                        </Row>
                                    )}
                                </Form>
                            </div>
                        </TabPane>
                    ))}
                </Tabs>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    background: '#fafafa', 
                    borderRadius: '8px',
                    border: '1px dashed #d9d9d9'
                }}>
                    <Text type="secondary">No bank accounts added yet.</Text>
                    {editable && (
                        <div style={{ marginTop: '16px' }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBank}>
                                Add First Bank Account
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BankStep;
