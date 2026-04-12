import {
    Table, Button, Input, Space, Typography, message, Modal, Tooltip
} from 'antd';
import { useState, useEffect } from 'react';
import {
    SearchOutlined,
    LeftOutlined,
    UploadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { getVehicleStockInwards, deleteVehicleStockInward } from '../../api/vehicleStockInward';
import InwardImportModal from './components/InwardImportModal';
import styles from './VehicleStockInward.module.css';

const { Title } = Typography;
const { confirm } = Modal;

const VehicleStockInwardPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'import' | 'view' | 'edit'>('import');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getVehicleStockInwards();
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            message.error('Failed to fetch inward records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id: string) => {
        confirm({
            title: 'Are you sure you want to delete this record?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone and will remove all associated vehicle labels.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteVehicleStockInward(id);
                    if (res.data.success) {
                        message.success('Record deleted successfully');
                        fetchData();
                    }
                } catch (err) {
                    message.error('Failed to delete record');
                }
            },
        });
    };

    const handleAction = (mode: 'view' | 'edit', record: any) => {
        setModalMode(mode);
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleImportClick = () => {
        setModalMode('import');
        setSelectedRecord(null);
        setModalVisible(true);
    };

    const columns = [
        {
            title: 'Inward No',
            dataIndex: 'inwardNo',
            key: 'inwardNo',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoiceNo',
            key: 'invoiceNo',
        },
        {
            title: 'Dealer Name',
            dataIndex: 'dealerName',
            key: 'dealerName',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'DA Number',
            dataIndex: 'daNumber',
            key: 'daNumber',
        },
        {
            title: 'Total Vehicles',
            key: 'totalVehicles',
            render: (_, record: any) => record.items?.length || 0,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            type="text"
                            onClick={() => handleAction('view', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Record">
                        <Button
                            icon={<EditOutlined style={{ color: '#1a8a7a' }} />}
                            type="text"
                            onClick={() => handleAction('edit', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Record">
                        <Button
                            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                            type="text"
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredData = data.filter(item =>
        item.inwardNo?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.invoiceNo?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.dealerName?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <Space size="large">
                    <Button
                        icon={<LeftOutlined />}
                        shape="circle"
                        onClick={() => window.history.back()}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        Vehicle Stock Inward [{loading ? '...' : filteredData.length}]
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Search Inward Records"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={handleImportClick}
                        className={styles.importBtn}
                    >
                        Import Inward Record
                    </Button>
                </Space>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <InwardImportModal
                open={modalVisible}
                mode={modalMode}
                initialData={selectedRecord}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchData();
                }}
            />
        </div>
    );
};

export default VehicleStockInwardPage;
