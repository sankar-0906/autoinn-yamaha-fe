import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getFrameNumbers, createFrameNumber, updateFrameNumber, deleteFrameNumber } from '../../api/frameNumber';
import FrameNumberModal from './FrameNumberModal';
import styles from './FrameNumber.module.css';

const { Title, Text } = Typography;

const FrameNumberPage: React.FC = () => {
    const [frameNumbers, setFrameNumbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [pageSize, setPageSize] = useState(10);

    const fetchFrameNumbers = async () => {
        setLoading(true);
        try {
            const res = await getFrameNumbers();
            setFrameNumbers(res.data?.data || res.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch frame numbers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFrameNumbers();
    }, []);

    const handleAdd = () => {
        setSelectedFrame(null);
        setModalOpen(true);
    };

    const handleEdit = (frame: any) => {
        setSelectedFrame(frame);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this rule?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteFrameNumber(id);
                    message.success('Rule deleted successfully');
                    fetchFrameNumbers();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete rule');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedFrame) {
                await updateFrameNumber(selectedFrame.id, values);
                message.success('Rule updated successfully');
            } else {
                await createFrameNumber(values);
                message.success('Rule created successfully');
            }
            setModalOpen(false);
            fetchFrameNumbers();
        } catch (error: any) {
            message.error(error.message || 'Failed to save rule');
        } finally {
            setSaving(false);
        }
    };

    const filteredFrames = frameNumbers.filter(f =>
        f.manufacturer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.inferredField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.inputValue?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Manufacturer',
            dataIndex: ['manufacturer', 'name'],
            key: 'manufacturer',
        },
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Input Value',
            dataIndex: 'inputValue',
            key: 'inputValue',
        },
        {
            title: 'Inferred Field',
            dataIndex: 'inferredField',
            key: 'inferredField',
        },
        {
            title: 'Target Value',
            dataIndex: 'targetValue',
            key: 'targetValue',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)} className={styles.modifyLink}>
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
                        Frame Number Rules [{filteredFrames.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search rules"
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
                        New Rule
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredFrames}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: pageSize,
                        showSizeChanger: true,
                        onShowSizeChange: (_, size) => setPageSize(size),
                    }}
                    className={styles.frameTable}
                />
            </div>

            {modalOpen && (
                <FrameNumberModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    initialValues={selectedFrame}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default FrameNumberPage;
