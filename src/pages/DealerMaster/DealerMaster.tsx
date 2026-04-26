import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDealers, createDealer, updateDealer, deleteDealer } from '../../api/dealer';
import DealerMasterModal from './DealerMasterModal';
import styles from './DealerMaster.module.css';

const { Title, Text } = Typography;

const DealerMasterPage: React.FC = () => {
    const [dealers, setDealers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState<any>(null);
    const [readOnly, setReadOnly] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [hasCheckedUrl, setHasCheckedUrl] = useState(false);

    const fetchDealers = async () => {
        setLoading(true);
        try {
            const res = await getDealers({
                page,
                limit: pageSize,
                search: searchTerm
            });
            const { dealers, total } = res.data?.data || res.data || {};
            setDealers(dealers || []);
            setCount(total || 0);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch dealers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealers();
    }, [page, pageSize, searchTerm]);

    useEffect(() => {
        const dealerId = searchParams.get('id');
        if (dealerId && dealers.length > 0 && !hasCheckedUrl) {
            const dealer = dealers.find(d => d.id === dealerId);
            if (dealer) {
                handleModify(dealer);
                setHasCheckedUrl(true);
            }
        }
    }, [searchParams, dealers, hasCheckedUrl]);

    const handleAdd = () => {
        setSelectedDealer(null);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleModify = (dealer: any) => {
        setSelectedDealer(dealer);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleView = (dealer: any) => {
        setSelectedDealer(dealer);
        setReadOnly(true);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this dealer?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteDealer(id);
                    message.success('Dealer deleted successfully');
                    fetchDealers();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete dealer');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedDealer) {
                await updateDealer(selectedDealer.id, values);
                message.success('Dealer updated successfully');
            } else {
                await createDealer(values);
                message.success('Dealer created successfully');
            }
            setModalOpen(false);
            fetchDealers();
        } catch (error: any) {
            message.error(error.message || 'Failed to save dealer');
        } finally {
            setSaving(false);
        }
    };



    const columns = [
        {
            title: 'Dealer Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'success' : 'error'}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'City',
            dataIndex: ['address', 'district', 'name'],
            key: 'city',
            render: (city: string, record: any) => city || record.address?.locality || '-'
        },
        {
            title: 'GST Dealer Type',
            dataIndex: 'dealerType',
            key: 'dealerType',
            render: (type: string) => type || '-'
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleModify(record)} className={styles.modifyLink}>
                        Modify
                    </Button>
                    <Tag color="default" style={{ border: 'none', background: 'transparent' }}>|</Tag>
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
                        Dealers [{count}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Dealer"
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
                        Add Dealer
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={dealers}
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
                    onRow={(record) => ({
                        onClick: (e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                                return;
                            }
                            handleView(record);
                        }
                    })}
                    className={styles.dealerTable}
                />
            </div>

            {modalOpen && (
                <DealerMasterModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    initialValues={selectedDealer}
                    loading={saving}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
};

export default DealerMasterPage;
