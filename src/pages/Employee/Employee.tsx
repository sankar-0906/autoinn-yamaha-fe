import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, TeamOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../api/employee';
import EmployeeModal from './EmployeeModal';
import styles from './Employee.module.css';

const { Title, Text } = Typography;

const EmployeePage: React.FC = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('active');
    const [readOnly, setReadOnly] = useState(false);
    const navigate = useNavigate();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            setEmployees(res.data.users || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAdd = () => {
        setSelectedEmployee(null);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleModify = (employee: any) => {
        setSelectedEmployee(employee);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleView = (employee: any) => {
        setSelectedEmployee(employee);
        setReadOnly(true);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEmployee(id);
            message.success('Employee deleted successfully');
            fetchEmployees();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete employee');
        }
    };

    const handleSave = async (values: any) => {
        try {
            // Remove empty password if not provided during update
            const payload = { ...values };
            if (!payload.password) {
                delete payload.password;
            }

            if (selectedEmployee) {
                await updateEmployee(selectedEmployee.id, payload);
                message.success('Employee updated successfully');
            } else {
                await createEmployee(payload);
                message.success('Employee created successfully');
            }
            setModalOpen(false);
            fetchEmployees();
        } catch (error: any) {
            message.error(error.message || 'Failed to save employee');
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.profile?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone?.includes(searchTerm);

        const matchesStatus = (activeTab === 'active' && emp.status === true) ||
            (activeTab === 'inactive' && emp.status === false);

        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: ['profile', 'employeeName'],
            key: 'name',
            render: (text: string) => <Text strong>{text || '-'}</Text>
        },
        {
            title: 'Mobile Number',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Alternate Number',
            dataIndex: 'phone2',
            key: 'phone2',
            render: (text: string) => text || '-'
        },
        {
            title: 'Department',
            dataIndex: ['profile', 'department', 'role'],
            key: 'department',
            render: (role: string) => role || '-'
        },
        {
            title: 'Joined On',
            dataIndex: ['profile', 'dateOfJoining'],
            key: 'joinedOn',
            render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-'
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleModify(record)} className={styles.modifyLink}>
                        Modify
                    </Button>
                    <Text type="secondary">|</Text>
                    <Button type="link" danger onClick={() => handleDelete(record.id)} className={styles.deleteLink}>
                        Delete
                    </Button>
                </Space>
            )
        },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <Space size="large">
                    <Button
                        icon={<LeftOutlined />}
                        shape="circle"
                        onClick={() => navigate('/company')}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        Employee [{filteredEmployees.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Employee"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className={styles.addBtn}
                    >
                        Add Employee
                    </Button>
                </Space>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={styles.tabs}
                items={[
                    {
                        key: 'active',
                        label: <span><TeamOutlined className={styles.tabIcon} />Active Employee</span>,
                    },
                    {
                        key: 'inactive',
                        label: <span><UserDeleteOutlined className={styles.tabIcon} />InActive Employee</span>,
                    }
                ]}
            />

            <Table
                columns={columns}
                dataSource={filteredEmployees}
                loading={loading}
                rowKey="id"
                onRow={(record) => ({
                    onClick: (e) => {
                        // Don't trigger if clicking on action buttons
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                            return;
                        }
                        handleView(record);
                    },
                    style: { cursor: 'pointer' }
                })}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    locale: { items_per_page: '' }
                }}
                className={styles.employeeTable}
            />

            <EmployeeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialValues={selectedEmployee}
                loading={loading}
                readOnly={readOnly}
            />
        </div>
    );
};

export default EmployeePage;
