import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Typography, Select, Button, Spin, Empty, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './VehicleInventory.module.css';
import { getInventorySummary, getInventoryCounts } from '../../api/vehicleInventory';
import { getDealers as getAllDealers } from '../../api/dealer';
import VehicleCountModal from './components/VehicleCountModal';

const { Title, Text } = Typography;
const { Option } = Select;

const VehicleInventory: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dealers, setDealers] = useState<any[]>([]);
    const [selectedDealer, setSelectedDealer] = useState<string>('all');
    const [summary, setSummary] = useState<any[]>([]);
    const [counts, setCounts] = useState<any>({ total: 0, categoryWise: [], dealerWise: [] });
    const [isCountModalVisible, setIsCountModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchDealers();
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedDealer]);

    const fetchDealers = async () => {
        try {
            const res = await getAllDealers({ limit: 1000 });
            setDealers(res.data?.dealers || res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch dealers', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, countsRes] = await Promise.all([
                getInventorySummary({ dealerId: selectedDealer }),
                getInventoryCounts({ dealerId: selectedDealer })
            ]);
            setSummary(summaryRes.data?.data || []);
            setCounts(countsRes.data?.data || { total: 0, categoryWise: [], dealerWise: [] });
        } catch (error) {
            console.error('Failed to fetch inventory data', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSummary = summary.filter((item: any) =>
        item.modelName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.modelCode?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Model Name',
            dataIndex: 'modelName',
            key: 'modelName',
            render: (text: string, record: any) => (
                <Text style={{ fontWeight: 500 }}>{record.modelCode} - {text}</Text>
            )
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Text style={{ color: '#64748b' }}>{category?.toUpperCase()}</Text>
        },
        {
            title: 'Color',
            dataIndex: 'color',
            key: 'color',
            render: (color: string) => <Text style={{ color: '#64748b' }}>{color}</Text>
        },
        {
            title: 'Dealer',
            dataIndex: 'dealerName',
            key: 'dealerName',
            render: (text: string) => <Text style={{ color: '#64748b' }}>{text}</Text>
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center' as const,
            render: (qty: number) => <Text strong>{qty}</Text>
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <a
                    className={styles.viewLink}
                    onClick={() => navigate(`/company/vehicle-inventory/details?modelId=${record.modelId}&colorCode=${record.colorCode}&dealerId=${selectedDealer}`)}
                >
                    View
                </a>
            )
        }
    ];

    return (
        <div className={styles.pageContainer} style={{ padding: 0 }}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Title level={4} className={styles.title}>
                        Vehicle Inventory [{filteredSummary.length}]
                    </Title>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Input
                        placeholder="Search Inventory"
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: 220 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type="default"
                        style={{
                            backgroundColor: 'white',
                            color: '#6c7a89',
                            borderColor: 'white',
                            fontWeight: 600
                        }}
                        onClick={() => setIsCountModalVisible(true)}
                    >
                        View Count Details
                    </Button>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Space>
                        <Text strong>Dealer:</Text>
                        <Select
                            style={{ width: 200 }}
                            value={selectedDealer}
                            onChange={setSelectedDealer}
                        >
                            <Option value="all">ALL</Option>
                            {dealers.map(d => (
                                <Option key={d.id} value={d.id}>{d.name}</Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                <Card className={styles.tableCard}>
                    <Table
                        columns={columns}
                        dataSource={filteredSummary}
                        loading={loading}
                        rowKey="key"
                        pagination={{
                            pageSize: pageSize,
                            showSizeChanger: true,
                            onShowSizeChange: (_, size) => setPageSize(size),
                        }}
                        size="small"
                        rowClassName={(_, index) => index % 2 === 0 ? styles.inventoryRow : `${styles.inventoryRow} ${styles.alternateRow}`}
                        onRow={(record) => ({
                            onClick: () => navigate(`/company/vehicle-inventory/details?modelId=${record.modelId}&colorCode=${record.colorCode}&dealerId=${selectedDealer}`),
                            style: { cursor: 'pointer' }
                        })}
                        locale={{
                            emptyText: loading ? <Spin /> : <Empty description="No records found" />
                        }}
                    />
                </Card>
            </div>

            <VehicleCountModal
                visible={isCountModalVisible}
                onCancel={() => setIsCountModalVisible(false)}
                dealers={dealers}
                initialCounts={counts}
            />
        </div>
    );
};

export default VehicleInventory;
