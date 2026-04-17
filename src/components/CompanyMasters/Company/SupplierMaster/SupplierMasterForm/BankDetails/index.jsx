import React, { useState, useEffect } from "react";
import { ContactsOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Row,
  Col,
  Table,
  Empty,
  Typography,
  Popconfirm,
  Divider,
  Button,
} from "antd";

const { Text } = Typography;

function BankDetails({
  form,
  validityRef,
  data,
  clearRef,
  editable,
  values,
  setData,
  error,
  setError,
  setBankDelData,
  delbankData
}) {
  const [dataSource, setDataSource] = useState([]);
  const [editBank, setEditBank] = useState(null);

  useEffect(() => {
    if (data.bank) {
      setDataSource(data.bank);
    }
    clearRef.current = () => {
      form.resetFields();
    };
    validityRef.current = () => {
      return true;
    };
    return () => {
      validityRef.current = null;
      clearRef.current = null;
    };
  }, [data.bank]);

  const addData = async () => {
    try {
      const dataObj = await form.validateFields();
      let dataBanks = [...dataSource];
      if (editBank) {
        let index = dataBanks.findIndex(e => e.id === editBank);
        dataObj.id = editBank;
        if (index !== -1) dataBanks[index] = dataObj;
        setEditBank(null);
      } else {
        dataBanks.push(dataObj);
      }

      setDataSource(dataBanks);
      setData({ ...data, bank: dataBanks });
      form.resetFields();
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  const deleteData = (dataDelete) => {
    let dataBanks = dataSource.filter(d => d.accountNumber !== dataDelete.accountNumber);
    setDataSource(dataBanks);
    if (dataDelete.id) {
      setBankDelData([...delbankData, dataDelete]);
    }
    setData({ ...data, bank: dataBanks });
  };

  const column = [
    { title: <Text strong>Bank Name</Text>, dataIndex: "name", key: "name", render: (text) => <span>{text}</span> },
    { title: <Text strong>Account Name</Text>, dataIndex: "accountName", key: "accountName", render: (text) => <span>{text}</span> },
    { title: <Text strong>Account Number</Text>, dataIndex: "accountNumber", key: "accountNumber", render: (text) => <span>{text}</span> },
    { title: <Text strong>IFSC</Text>, dataIndex: "ifsc", key: "ifsc", render: (text) => <span>{text}</span> },
    {
      title: <Text strong>Action</Text>,
      render: (record) => (
        <div>
          {record.id ? (
            <span>
              <EditOutlined onClick={(e) => {
                e.stopPropagation();
                setEditBank(record.id);
                form.setFieldsValue(record);
              }} />
              <Divider type="vertical" />
            </span>
          ) : null}
          <Popconfirm title="Delete Account?" onConfirm={() => deleteData(record)}>
            <DeleteOutlined />
          </Popconfirm>
        </div>
      )
    },
  ];

  return (
    <div>
      <Table
        locale={{ emptyText: <Empty description={<Text disabled strong>No Accounts</Text>} image={<ContactsOutlined />} /> }}
        rowKey={(record) => record.id || record.accountNumber}
        pagination={false}
        size="small"
        columns={column.filter(col => col.title.props.children !== "Action" || !editable)}
        style={{ cursor: "pointer", marginTop: "5vh" }}
        dataSource={dataSource}
      />
      <Form form={form} layout="vertical" style={{ marginTop: "3vh", display: !editable ? "" : "none" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="Bank Name" rules={[{ required: true, message: "Enter Bank Name!" }]}>
              <Input placeholder="Bank Name" disabled={editable} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="accountName" label="Account Name" rules={[{ required: true, message: "Enter Account Name!" }]}>
              <Input placeholder="Account Name" disabled={editable} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true, message: "Enter Account Number!" }]}>
              <Input placeholder="Account Number" disabled={editable} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="ifsc" label="IFSC Code" rules={[{ required: true, message: "Enter IFSC!" }]}>
              <Input placeholder="IFSC Code" disabled={editable} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button type="primary" style={{ marginTop: "42px" }} onClick={addData}>Save</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default BankDetails;
