import React, { useState, useEffect } from 'react';
import { Modal, Table, Typography, Select, Space, Spin } from 'antd';
import styles from '../VehicleInventory.module.css';
import { getInventoryCounts } from '../../../api/vehicleInventory';
import { CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

interface VehicleCountModalProps {
    visible: boolean;
    onCancel: () => void;
    dealers: any[];
    initialCounts: any;
}

const VehicleCountModal: React.FC<VehicleCountModalProps> = ({ visible, onCancel, dealers, initialCounts }) => {
    const [localDealer, setLocalDealer] = useState(initialCounts?.dealerId || 'all');
    const [counts, setCounts] = useState(initialCounts);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setLocalDealer('all');
            setCounts(initialCounts);
        }
    }, [visible, initialCounts]);

    useEffect(() => {
        if (visible && localDealer !== 'all') {
            fetchCounts();
        } else if (visible && localDealer === 'all') {
            setCounts(initialCounts);
        }
    }, [localDealer]);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const res = await getInventoryCounts({ dealerId: localDealer });
            setCounts(res.data?.data || { total: 0, categoryWise: [], dealerWise: [] });
        } catch (error) {
            console.error('Failed to fetch counts', error);
        } finally {
            setLoading(false);
        }
    };

    const dealerColumns = [
        {
            title: 'Data',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            align: 'right' as const,
        }
    ];

    const categoryColumns = [
        {
            title: 'Data',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            align: 'right' as const,
        }
    ];

    return (
        <Modal
            title={<div className={styles.modalHeaderTitle}>Vehicle Count Details</div>}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
            className={styles.countModal}
            closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '18px' }} />}
            maskClosable={false}
        >
            <div style={{ padding: '20px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <Space size="middle">
                        <Text strong>Dealer:</Text>
                        <Select
                            style={{ width: 220 }}
                            value={localDealer}
                            onChange={setLocalDealer}
                            size="middle"
                            placeholder="Select Dealer"
                        >
                            <Option value="all">ALL DEALERS</Option>
                            {dealers.map(d => (
                                <Option key={d.id} value={d.id}>{d.name}</Option>
                            ))}
                        </Select>
                    </Space>

                    <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: '13px', color: '#64748b', marginRight: '8px', textTransform: 'uppercase' }}>Total Stock:</Text>
                        <Text style={{ fontSize: '20px', color: '#0d9488', fontWeight: '800' }}>{loading ? <Spin size="small" /> : counts.total}</Text>
                    </div>
                </div>

                <Spin spinning={loading}>
                    <div className={styles.modalSection}>
                        <Title level={5} className={styles.sectionTitle}>Dealer Wise</Title>
                        <Table
                            columns={dealerColumns}
                            dataSource={counts.dealerWise || []}
                            pagination={false}
                            size="small"
                            rowKey="id"
                            className={styles.countTable}
                            rowClassName={(_, index) => index % 2 === 0 ? '' : styles.alternateRow}
                        />
                    </div>

                    <div className={styles.modalSection} style={{ marginTop: '24px' }}>
                        <Title level={5} className={styles.sectionTitle}>Category Wise</Title>
                        <Table
                            columns={categoryColumns}
                            dataSource={counts.categoryWise || []}
                            pagination={false}
                            size="small"
                            rowKey="name"
                            className={styles.countTable}
                            rowClassName={(_, index) => index % 2 === 0 ? '' : styles.alternateRow}
                        />
                    </div>
                </Spin>
            </div>
        </Modal>
    );
};

export default VehicleCountModal;
