import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getIdGenerators, createIdGenerator, updateIdGenerator, deleteIdGenerator } from '../../api/idGenerator';
import IdGeneratorModal from './IdGeneratorModal';
import styles from './IdGenerator.module.css';

const { Title, Text } = Typography;

const IdGeneratorPage: React.FC = () => {
    const [idGenerators, setIdGenerators] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGenerator, setSelectedGenerator] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    const fetchIdGenerators = async () => {
        setLoading(true);
        try {
            const res = await getIdGenerators({
                page,
                limit: pageSize,
                search: searchTerm
            });
            const { idCreations, total } = res.data || {};
            setIdGenerators(idCreations || []);
            setCount(total || 0);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch ID generators');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIdGenerators();
    }, [page, pageSize, searchTerm]);

    const handleAdd = () => {
        setSelectedGenerator(null);
        setModalOpen(true);
    };

    const handleModify = (generator: any) => {
        setSelectedGenerator(generator);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this ID generator rule?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteIdGenerator(id);
                    message.success('ID generator rule deleted successfully');
                    fetchIdGenerators();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete ID generator rule');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedGenerator) {
                await updateIdGenerator(selectedGenerator.id, values);
                message.success('ID generator rule updated successfully');
            } else {
                await createIdGenerator(values);
                message.success('ID generator rule created successfully');
            }
            setModalOpen(false);
            fetchIdGenerators();
        } catch (error: any) {
            message.error(error.message || 'Failed to save ID generator rule');
        } finally {
            setSaving(false);
        }
    };



    const columns = [
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            render: (text: string) => <Text>{text}</Text>
        },
        {
            title: 'Sub Module',
            dataIndex: 'subModule',
            key: 'subModule',
        },
        {
            title: 'Static Prefix',
            dataIndex: 'text',
            key: 'text',
        },
        {
            title: 'Upcoming ID',
            dataIndex: 'count',
            key: 'count',
            render: (count: string, record: any) => `${record.text}${count || record.startCount || ''}`
        },
        {
            title: 'Date of Creation',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleModify(record)} className={styles.modifyLink}>
                        Modify
                    </Button>
                    <Text disabled>|</Text>
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
                        ID Generator [{count}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search ID"
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
                        Generate New Id
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={idGenerators}
                    loading={loading}
                    rowKey="id"
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
                    }}
                    className={styles.idTable}
                />
            </div>

            {modalOpen && (
                <IdGeneratorModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    initialValues={selectedGenerator}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default IdGeneratorPage;
