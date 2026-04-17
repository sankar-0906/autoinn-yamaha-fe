import React from "react";
import { Table, Divider, Popconfirm, Tag, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;
const SupplierMasterTable = ({
  pagination,
  dataSource,
  setValues,
  setEditable,
  setVisible,
  deleteSupplier,
  tableLoading,
  modify,
  deleteAccess,
}) => {
  const navigate = useNavigate();
  const setData = (data) => {
    setVisible(true);
    setValues(data);
  };

  const column = [
    {
      title: "Supplier Name",
      dataIndex: "name",
      key: "supplierName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Supplier Type",
      dataIndex: "supplierType",
      key: "type",
      render: (text) => text.map((value) => <Tag color="blue" key={1}>{value}</Tag>),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "branch",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "City",
      dataIndex: "address",
      key: "city",
      render: (text) => <span>{text && text.district.name}</span>,
    },
    {
      title: "GST D.Type",
      dataIndex: "dealerType",
      key: "dealerType",
      render: (text) => (
        <span>
          {text === "RegisteredDealer"
            ? "Registered Dealer"
            : text === "UnregisteredDealer"
              ? "Unregistered Dealer"
              : text === "UINHolder"
                ? "UIN Holder"
                : "Composition Dealer"}
        </span>
      ),
    },
    {
      title: "Action",
      render: (data) => (
        <div>
          {modify ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setEditable(false);
                setData(data);
              }}
              className="linkylink"
              style={{ color: '#52c41a', cursor: 'pointer' }}
            >
              Modify
            </span>
          ) : (
            <span></span>
          )}

          {deleteAccess ? (
            <Popconfirm
              title="Are you sure delete this Supplier?"
              okText="Yes"
              cancelText="No"
              onCancel={(e) => {
                e.stopPropagation();
              }}
              onConfirm={(e) => {
                e.stopPropagation();
                deleteSupplier(data.id);
              }}
            >
              <span className="linkylink" onClick={(e) => e.stopPropagation()} style={{ color: '#ff4d4f', cursor: 'pointer' }}>
                <Divider type="vertical" />
                Delete
              </span>
            </Popconfirm>
          ) : (
            <span></span>
          )}
          {!modify && !deleteAccess ? (
            <Text strong disabled>
              No Actions Given
            </Text>
          ) : (
            <span></span>
          )}
        </div>
      ),
    },
  ];
  return (
    <Table
      rowKey={(record) => record.id}
      columns={column}
      pagination={pagination}
      dataSource={dataSource}
      loading={tableLoading}
      onRow={(record) => ({
        onClick: () => {
          setEditable(true);
          setData(record);
        },
      })}
    />
  );
};

export default SupplierMasterTable;
