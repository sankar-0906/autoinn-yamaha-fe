import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getManufacturers, createManufacturer, updateManufacturer, deleteManufacturer } from '../../api/manufacturer';
import ManufacturerModal from './ManufacturerModal';
import styles from './Manufacturer.module.css';

const { Title, Text } = Typography;

const ManufacturerPage: React.FC = () => {
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
    const [readOnly, setReadOnly] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    const fetchManufacturers = async () => {
        setLoading(true);
        try {
            const res = await getManufacturers({
                page,
                limit: pageSize,
                search: searchTerm
            });
            const { manufacturers, total } = res.data || {};
            setManufacturers(manufacturers || []);
            setCount(total || 0);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch manufacturers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManufacturers();
    }, [page, pageSize, searchTerm]);

    const handleAdd = () => {
        setSelectedManufacturer(null);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleModify = (manufacturer: any) => {
        setSelectedManufacturer(manufacturer);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleView = (manufacturer: any) => {
        setSelectedManufacturer(manufacturer);
        setReadOnly(true);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this manufacturer?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteManufacturer(id);
                    message.success('Manufacturer deleted successfully');
                    fetchManufacturers();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete manufacturer');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedManufacturer) {
                await updateManufacturer(selectedManufacturer.id, values);
                message.success('Manufacturer updated successfully');
            } else {
                await createManufacturer(values);
                message.success('Manufacturer created successfully');
            }
            setModalOpen(false);
            fetchManufacturers();
        } catch (error: any) {
            message.error(error.message || 'Failed to save manufacturer');
        } finally {
            setSaving(false);
        }
    };



    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text || '-'}</Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => text || '-'
        },
        {
            title: 'Created On',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
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
                        Manufacturer [{count}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Manufacturer"
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
                        Add Manufacturer
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={manufacturers}
                    loading={loading}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: (e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                                return;
                            }
                            handleView(record);
                        },
                        style: { cursor: 'pointer' }
                    })}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: count,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onChange: (p) => setPage(p),
                        onShowSizeChange: (_, size) => {
                            setPageSize(size);
                            setPage(1);
                        },
                        locale: { items_per_page: '' }
                    }}
                    className={styles.manufacturerTable}
                />
            </div>

            <ManufacturerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialValues={selectedManufacturer}
                loading={saving}
                readOnly={readOnly}
            />
        </div>
    );
};

export default ManufacturerPage;
