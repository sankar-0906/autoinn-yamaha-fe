import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Typography, Space, message, Modal, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, LeftOutlined, ExportOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../api/vehicleMaster';
import VehicleMasterModal from './VehicleMasterModal';
import styles from './VehicleMaster.module.css';

const { Title, Text } = Typography;

const VehicleMasterPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [readOnly, setReadOnly] = useState(false);
    const [isCloning, setIsCloning] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await getVehicles();
            setVehicles(res.data?.response?.data?.VehicleMaster || res.data?.data || res.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAdd = () => {
        setSelectedVehicle(null);
        setReadOnly(false);
        setIsCloning(false);
        setModalOpen(true);
    };

    const handleModify = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setReadOnly(false);
        setIsCloning(false);
        setModalOpen(true);
    };

    const handleView = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setReadOnly(true);
        setModalOpen(true);
    };

    const handleClone = (vehicle: any) => {
        setSelectedVehicle({
            ...vehicle,
            modelName: `${vehicle.modelName} (Copy)`
        });
        setReadOnly(false);
        setIsCloning(true);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this vehicle?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteVehicle(id);
                    message.success('Vehicle deleted successfully');
                    fetchVehicles();
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete vehicle');
                }
            },
        });
    };

    const handleSave = async (values: any) => {
        setSaving(true);
        try {
            if (selectedVehicle && !isCloning) {
                await updateVehicle(selectedVehicle.id, values);
                message.success('Vehicle updated successfully');
            } else {
                await createVehicle(values);
                message.success('Vehicle created successfully');
            }
            setModalOpen(false);
            fetchVehicles();
        } catch (error: any) {
            message.error(error.message || 'Failed to save vehicle');
        } finally {
            setSaving(false);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.manufacturer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Model',
            key: 'model',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.modelCode || '-'}</Text>
                    <Text type="secondary">{record.modelName || '-'}</Text>
                </Space>
            )
        },
        {
            title: 'Manufacturer',
            dataIndex: ['manufacturer', 'name'],
            key: 'manufacturer',
            render: (text: string) => text || '-'
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-'
        },
        {
            title: 'Status',
            dataIndex: 'vehicleStatus',
            key: 'status',
            render: (text: string) => (
                <Tag color={text === 'Available' ? 'green' : 'orange'}>
                    {text || 'Unknown'}
                </Tag>
            )
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
                    <Text type="secondary">|</Text>
                    <Button type="link" onClick={() => handleClone(record)} className={styles.cloneLink} icon={<CopyOutlined />}>
                        Clone
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
                        Vehicle Master [{filteredVehicles.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Vehicle Name"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        icon={<ExportOutlined />}
                        className={styles.exportBtn}
                    >
                        Import / Export CSV
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        className={styles.addBtn}
                    >
                        Add Vehicle
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredVehicles}
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
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    className={styles.vehicleTable}
                />
            </div>

            {modalOpen && (
                <VehicleMasterModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    initialValues={selectedVehicle}
                    loading={saving}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
};

export default VehicleMasterPage;
