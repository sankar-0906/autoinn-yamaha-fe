import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Typography, Button, Image, Empty, Space, Tag, Popover, Select } from 'antd';
import { LeftOutlined, CalendarOutlined, CarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './VehicleInventory.module.css';
import { getInventoryDetails } from '../../api/vehicleInventory';
import { getDealers as getAllDealers, updateDealer } from '../../api/dealer';
import DealerMasterModal from '../DealerMaster/DealerMasterModal';
import moment from 'moment';
import { message } from 'antd';

const { Title, Text } = Typography;

const VehicleInventoryDetail: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const modelId = searchParams.get('modelId');
    const colorCode = searchParams.get('colorCode');

    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<any[]>([]);
    const [dealers, setDealers] = useState<any[]>([]);
    const [vehicleInfo, setVehicleInfo] = useState<any>(null);
    const [dealerModalOpen, setDealerModalOpen] = useState(false);
    const [selectedDealerForModal, setSelectedDealerForModal] = useState<any>(null);
    const [savingDealer, setSavingDealer] = useState(false);
    const [dealerFilter, setDealerFilter] = useState<string>(searchParams.get('dealerId') || 'all');

    useEffect(() => {
        fetchDealers();
    }, []);

    useEffect(() => {
        if (modelId) {
            fetchUnits();
        }
    }, [modelId, colorCode]);

    const fetchDealers = async () => {
        try {
            const res = await getAllDealers();
            setDealers(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch dealers', error);
        }
    };

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await getInventoryDetails({ modelId, colorCode, dealerId: 'all' });
            const data = res.data?.data || [];
            setUnits(data);
            if (data.length > 0) {
                const first = data[0];
                setVehicleInfo({
                    modelName: first.lineItem?.vehicleMaster?.modelName,
                    modelCode: first.lineItem?.vehicleMaster?.modelCode,
                    color: first.image?.color || first.colorCode,
                    colorCode: first.colorCode,
                    imageUrl: first.image?.url
                });
            }
        } catch (error) {
            console.error('Failed to fetch unit details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDealer = async (values: any) => {
        setSavingDealer(true);
        try {
            if (selectedDealerForModal) {
                await updateDealer(selectedDealerForModal.id, values);
                message.success('Dealer updated successfully');
                fetchDealers();
                fetchUnits(); // Refresh units to get updated dealer info if needed
            }
            setDealerModalOpen(false);
        } catch (error: any) {
            message.error(error.message || 'Failed to save dealer');
        } finally {
            setSavingDealer(false);
        }
    };

    const columns = [
        {
            title: 'MFG Date',
            dataIndex: 'mfgDate',
            key: 'mfgDate',
            render: (date: string) => (
                <Space>
                    <CalendarOutlined style={{ color: '#64748b' }} />
                    <Text>{date ? moment(date).format('MMM YYYY') : 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Chassis No',
            dataIndex: 'chassisNo',
            key: 'chassisNo',
            className: styles.vehicleId,
            render: (text: string) => <Tag color="default" style={{ border: 'none', background: '#f1f5f9', fontWeight: 600 }}>{text}</Tag>
        },
        {
            title: 'Engine No',
            dataIndex: 'engineNo',
            key: 'engineNo',
            className: styles.vehicleId
        },
        {
            title: 'Dealer Name',
            key: 'dealerName',
            render: (_: any, record: any) => <Text style={{ color: '#64748b' }}>{record.lineItem?.inward?.dealer?.name || 'N/A'}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'green';
                if (status === 'SOLD') color = 'red';
                if (status === 'RESERVED') color = 'orange';
                return <Tag color={color} style={{ borderRadius: '4px', fontWeight: 600 }}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => {
                const inward = record.lineItem?.inward;
                const dealer = inward?.dealer;

                const content = (
                    <div style={{ padding: '4px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <Text type="secondary">Invoice Date: </Text>
                            <Text>{inward?.date ? moment(inward.date).format('DD-MM-YYYY') : '-'}</Text>
                        </div>
                        <div>
                            <Text type="secondary">Supplier: </Text>
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedDealerForModal(dealer);
                                    setDealerModalOpen(true);
                                }}
                                style={{ color: '#0891b2', textDecoration: 'underline' }}
                            >
                                {dealer?.name || '-'}
                            </a>
                        </div>
                    </div>
                );

                return (
                    <Popover content={content} trigger="hover" placement="left">
                        <Button type="link" icon={<InfoCircleOutlined />} />
                    </Popover>
                );
            }
        }
    ];

    return (
        <div className={styles.pageContainer} style={{ padding: 0 }}>
            {/* Header matches Image 3 header style */}
            {/* Header with Background and Navigation */}
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                        type="link"
                        icon={<LeftOutlined style={{ fontSize: '18px' }} />}
                        onClick={() => navigate('/company/vehicle-inventory')}
                        style={{ color: 'white', padding: '0 8px' }}
                    />
                    <Title level={4} className={styles.modalHeaderTitle} style={{ margin: 0, fontSize: '18px' }}>
                        Vehicle Inventory Details
                    </Title>
                </div>
            </div>

            {/* Top info section matches Image 3 */}
            <div className={styles.detailFormSection}>
                <Row gutter={40} align="middle">
                    <Col span={6}>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <div className={styles.detailField}>
                                <div className={styles.fieldLabel}>Model Name :</div>
                                <div className={styles.fieldValue}>{vehicleInfo?.modelCode} - {vehicleInfo?.modelName}</div>
                            </div>
                            <div className={styles.detailField}>
                                <div className={styles.fieldLabel}>Dealer Name :</div>
                                <div className={styles.fieldValue}>
                                    <Select
                                        style={{ width: 200 }}
                                        value={dealerFilter}
                                        onChange={setDealerFilter}
                                        size="small"
                                    >
                                        <Select.Option value="all">ALL DEALERS</Select.Option>
                                        {Array.from(new Set(units.map(u => u.lineItem?.inward?.dealer?.id).filter(Boolean))).map(id => {
                                            const dealerName = units.find(u => u.lineItem?.inward?.dealer?.id === id)?.lineItem?.inward?.dealer?.name;
                                            return <Select.Option key={id as string} value={id as string}>{dealerName}</Select.Option>;
                                        })}
                                    </Select>
                                </div>
                            </div>
                            <div className={styles.detailField}>
                                <div className={styles.fieldLabel}>Current Stock :</div>
                                <div className={styles.fieldValue}>{units.filter(u => dealerFilter === 'all' || u.lineItem?.inward?.dealer?.id === dealerFilter).length}</div>
                            </div>
                        </Space>
                    </Col>

                    <Col span={10} style={{ textAlign: 'center' }}>
                        {vehicleInfo?.imageUrl ? (
                            <Image
                                src={vehicleInfo.imageUrl}
                                className={styles.detailImage}
                                preview={false}
                            />
                        ) : (
                            <div style={{ height: '120px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CarOutlined style={{ fontSize: '48px', color: '#cbd5e1' }} />
                            </div>
                        )}
                    </Col>

                    <Col span={8}>
                        <Space direction="vertical" size={4}>
                            <div>
                                <Text strong>Color Code: </Text>
                                <Text>{vehicleInfo?.colorCode}</Text>
                            </div>
                            <div>
                                <Text strong>Color Name: </Text>
                                <Text>{vehicleInfo?.color}</Text>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </div>

            <div style={{ padding: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={units.filter(u => dealerFilter === 'all' || u.lineItem?.inward?.dealer?.id === dealerFilter)}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className={styles.inventoryTable}
                    rowClassName={(_, index) => index % 2 === 0 ? '' : styles.alternateRow}
                    locale={{
                        emptyText: <Empty description="No units found" />
                    }}
                />
            </div>

            {dealerModalOpen && (
                <DealerMasterModal
                    open={dealerModalOpen}
                    onClose={() => setDealerModalOpen(false)}
                    onSave={handleSaveDealer}
                    initialValues={selectedDealerForModal}
                    loading={savingDealer}
                    readOnly={false}
                />
            )}
        </div>
    );
};

export default VehicleInventoryDetail;
