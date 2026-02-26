import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Modal, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/department';
import DepartmentModal from './DepartmentModal';
import styles from './Department.module.css';

const { Title, Text } = Typography;

const DepartmentPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [readOnly, setReadOnly] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await getDepartments();
            setDepartments(res.data?.data || []);
        } catch (error: any) {
            message.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingDept(null);
        setReadOnly(false);
        setIsModalOpen(true);
    };

    const handleModify = (record: any) => {
        setEditingDept(record);
        setReadOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (record: any) => {
        setEditingDept(record);
        setReadOnly(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this department?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteDepartment(id);
                    message.success('Department deleted successfully');
                    fetchDepartments();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Delete failed');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (editingDept) {
                await updateDepartment(editingDept.id, values);
                message.success('Department updated successfully');
            } else {
                await createDepartment(values);
                message.success('Department created successfully');
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to save department');
        } finally {
            setSaving(false);
        }
    };

    const filteredDepartments = departments.filter(d =>
        d.role.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Department Name',
            dataIndex: 'role',
            key: 'role',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Employee Count',
            dataIndex: '_count',
            key: 'employeeCount',
            render: (count: any) => count?.employeeProfiles || 0
        },
        {
            title: 'Created On',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => handleModify(record)}
                        className={styles.modifyLink}
                    >
                        Modify
                    </Button>
                    <Text type="secondary">|</Text>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record.id)}
                        className={styles.deleteLink}
                    >
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
                    <Button icon={<LeftOutlined />} shape="circle" onClick={() => window.history.back()} />
                    <Title level={4} style={{ margin: 0 }}>
                        Department [{departments.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Departments"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className={styles.addBtn}
                    >
                        Add Department
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredDepartments}
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
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        locale: { items_per_page: '' }
                    }}
                />
            </div>

            <DepartmentModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialValues={editingDept}
                loading={saving}
                readOnly={readOnly}
            />
        </div>
    );
};

export default DepartmentPage;
