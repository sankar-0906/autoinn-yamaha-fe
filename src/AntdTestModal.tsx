import React, { useState } from 'react';
import { Modal, Button, Select, Table, Row, Col, Divider, Typography } from 'antd';

const { Option } = Select;
const { Text, Title } = Typography;

interface AntdTestModalProps {
  open: boolean;
  close: () => void;
}

const AntdTestModal: React.FC<AntdTestModalProps> = ({ open, close }) => {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const branchOptions = [
    { id: '1', name: 'Main Branch' },
    { id: '2', name: 'West Side' },
  ];

  const denominations = [
    { denomination: 2000, count: 0, total: 0 },
    { denomination: 500, count: 0, total: 0 },
    { denomination: 200, count: 0, total: 0 },
    { denomination: 100, count: 0, total: 0 },
  ];

  const toData = [
    { denomination: 500, count: 0, total: 0 },
    { denomination: 200, count: 0, total: 0 },
    { denomination: 100, count: 0, total: 0 },
  ];

  const fromColumns = [
    { title: 'Denomination', dataIndex: 'denomination', key: 'denomination' },
    { title: 'Count', dataIndex: 'count', key: 'count' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
  ];

  const toColumns = [
    { title: 'Denomination', dataIndex: 'denomination', key: 'denomination' },
    { title: 'Count', dataIndex: 'count', key: 'count' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
  ];

  const totalFrom = 0;
  const totalTo = 0;

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      close();
    }, 1000);
  };

  return (
    <Modal
      title="Denomination Exchange (Deposit)"
      open={open}
      onCancel={close}
      width={900}
      footer={[
        <Button key="close" onClick={close}>
          Close
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          disabled={totalFrom === 0 || totalFrom !== totalTo}
        >
          Exchange Denominations
        </Button>,
      ]}
    >
      {/* ✅ Branch Row — aligned horizontally */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16, whiteSpace: "nowrap" }}>
          Branch:
        </Text>
        <Select
          style={{ width: 300, marginLeft: 10 }}
          placeholder="Select Branch"
          value={selectedBranch}
          onChange={handleBranchChange}
          disabled={loading}
        >
          {branchOptions?.map((b) => (
            <Option key={b.id} value={b.id}>
              {b.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* ✅ Tables Section */}
      <Row gutter={24}>
        <Col span={12}>
          {/* Title above table */}
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
            Reduce From (Release)
          </div>
          <Table
            dataSource={denominations}
            columns={fromColumns}
            rowKey="denomination"
            pagination={false}
            loading={loading}
          />
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <Text strong>Subtotal From: ₹{totalFrom.toLocaleString()}</Text>
          </div>
        </Col>

        <Col span={12}>
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
            Add To (Receive)
          </div>
          <Table
            dataSource={toData}
            columns={toColumns}
            rowKey="denomination"
            pagination={false}
          />
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <Text strong>Subtotal To: ₹{totalTo.toLocaleString()}</Text>
          </div>
        </Col>
      </Row>

      <Divider />

      {/* ✅ Total Section */}
      <div style={{ textAlign: "center" }}>
        {totalFrom !== totalTo && totalFrom > 0 && totalTo > 0 ? (
          <Text type="danger">
            Mismatch: Dif ₹{(totalFrom - totalTo).toLocaleString()}
          </Text>
        ) : (
          <Title level={4}>Total Balance: ₹{totalFrom.toLocaleString()}</Title>
        )}
      </div>
    </Modal>
  );
};

export default AntdTestModal;
