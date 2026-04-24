import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getParts, createPart, updatePart, deletePart } from '../../api/partsMaster';
import PartsMasterModal from './PartsMasterModal';
import styles from './PartsMaster.module.css';

const { Title } = Typography;

const PartsMasterPage: React.FC = () => {
    const [parts, setParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [readOnly, setReadOnly] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const fetchParts = async () => {
        setLoading(true);
        try {
            const res = await getParts();
            setParts(res.data?.data || res.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch parts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    const handleAdd = () => {
        setSelectedPart(null);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleModify = (part: any) => {
        setSelectedPart(part);
        setReadOnly(false);
        setModalOpen(true);
    };

    const handleView = (part: any) => {
        setSelectedPart(part);
        setReadOnly(true);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this part?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deletePart(id);
                    message.success('Part deleted successfully');
                    fetchParts();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete part');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedPart && !selectedPart.isClone) {
                await updatePart(selectedPart.id, values);
                message.success('Part updated successfully');
            } else {
                await createPart(values);
                message.success('Part created successfully');
            }
            setModalOpen(false);
            fetchParts();
        } catch (error: any) {
            message.error(error.message || 'Failed to save part');
        } finally {
            setSaving(false);
        }
    };

    const filteredParts = parts.filter(p =>
        p.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Part No',
            dataIndex: 'partNumber',
            key: 'partNumber',
            render: (text: string) => text
        },
        {
            title: 'Part Name',
            dataIndex: 'partName',
            key: 'partName',
        },
        {
            title: 'HSN',
            dataIndex: ['hsn', 'code'],
            key: 'hsn',
        },
        {
            title: 'MRP',
            dataIndex: 'mrp',
            key: 'mrp',
            render: (val: number) => val ? `₹${val.toFixed(2)}` : '-'
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleModify(record)} className={styles.modifyLink}>
                        Modify
                    </Button>
                    <Space size={4}>
                        <Tag color="default" style={{ border: 'none', background: 'transparent' }}>|</Tag>
                        <Button type="link" danger onClick={() => handleDelete(record.id)} className={styles.deleteLink}>
                            Delete
                        </Button>
                    </Space>
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
                        Parts [{filteredParts.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Part Number"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        icon={<UploadOutlined />}
                        className={styles.uploadBtn}
                    >
                        Upload CSV
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className={styles.addBtn}
                    >
                        Add Parts
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredParts}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onRow={(record) => ({
                        onClick: (e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                                return;
                            }
                            handleView(record);
                        }
                    })}
                    className={styles.partsTable}
                />
            </div>

            {modalOpen && (
                <PartsMasterModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    initialValues={selectedPart}
                    loading={saving}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
};

export default PartsMasterPage;
