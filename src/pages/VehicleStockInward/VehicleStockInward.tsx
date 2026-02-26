import {
    Table, Button, Input, Space, Typography, message
} from 'antd';
import { useState, useEffect } from 'react';
import {
    SearchOutlined,
    LeftOutlined,
    UploadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { getVehicleStockInwards } from '../../api/vehicleStockInward';
import InwardImportModal from './components/InwardImportModal';
import styles from './VehicleStockInward.module.css';

const { Title } = Typography;

const VehicleStockInwardPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [importModalVisible, setImportModalVisible] = useState(false);

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
                <Button
                    icon={<EyeOutlined />}
                    type="text"
                    onClick={() => message.info('View details coming soon')}
                />
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
                        Vehicle Stock Inward [{data.length}]
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
                        onClick={() => setImportModalVisible(true)}
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
                open={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onSuccess={() => {
                    setImportModalVisible(false);
                    fetchData();
                }}
            />
        </div>
    );
};

export default VehicleStockInwardPage;
