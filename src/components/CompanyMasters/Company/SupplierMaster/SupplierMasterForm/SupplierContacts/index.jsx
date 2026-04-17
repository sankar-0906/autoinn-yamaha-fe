import React, { useState, useEffect } from "react";
import { ContactsOutlined, DeleteOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
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
  message,
} from "antd";
import _ from "lodash";

const { Text } = Typography;

function SupplierContacts({
  form,
  validityRef,
  data,
  clearRef,
  editable,
  values,
  setData,
  error,
  setError,
  delData,
  setDelData
}) {
  const [dataSource, setDataSource] = useState([]);
  const [editPhone, setEditPhone] = useState(null);

  useEffect(() => {
    if (data.contact) {
      setDataSource(data.contact);
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
  }, [data.contact]);

  const addData = async () => {
    try {
      const dataObj = await form.validateFields();
      dataObj.valid = true;
      dataObj.whatsapp = true;
      if (values) {
        dataObj.id = "";
      }
      let dataContacts = [...dataSource];
      if (editPhone) {
        let index = dataContacts.findIndex(e => e.id === editPhone);
        dataObj.id = editPhone;
        if (index !== -1) dataContacts[index] = dataObj;
        setEditPhone(null);
      } else {
        dataContacts.push(dataObj);
      }

      setDataSource(dataContacts);
      let dataNew = { ...data, contact: dataContacts };
      setData(dataNew);
      form.resetFields(["name", "designation", "number"]);
    } catch (validationError) {
      console.error('Validation Failed:', validationError);
    }
  };

  const deleteData = (dataDelete) => {
    let dataContacts = dataSource.filter(d => d.number !== dataDelete.number);
    setDataSource(dataContacts);
    if (dataDelete.id) {
      setDelData([...delData, dataDelete]);
    }
    setData({ ...data, contact: dataContacts });
  };

  const column = [
    { title: <Text strong>Name</Text>, dataIndex: "name", key: "name", render: (text) => <span>{text}</span> },
    { title: <Text strong>Designation</Text>, dataIndex: "designation", key: "designation", render: (text) => <span>{text}</span> },
    {
      title: <Text strong>Phone Number</Text>,
      dataIndex: "number",
      key: "phone",
      render: (record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{record}</span>
          <PhoneOutlined style={{ color: '#52c41a', cursor: 'pointer', fontSize: '16px' }} />
        </div>
      )
    },
    { title: <Text strong>Valid</Text>, dataIndex: "valid", key: "valid", render: (record) => (record ? "yes" : "no") },
    { title: <Text strong>Whatsapp</Text>, dataIndex: "whatsapp", key: "whatsapp", render: (record) => (record ? "yes" : "no") },
    {
      title: <Text strong>Action</Text>,
      render: (record) => (
        <div>
          {record.id ? (
            <span>
              <EditOutlined onClick={(event) => {
                event.stopPropagation();
                setEditPhone(record.id);
                form.setFieldsValue(record);
              }} />
              <Divider type="vertical" />
            </span>
          ) : null}
          <Popconfirm title="Do you want to delete this?" onConfirm={() => deleteData(record)}>
            <DeleteOutlined />
          </Popconfirm>
        </div>
      )
    },
  ];

  return (
    <div>
      <Table
        locale={{ emptyText: <Empty description={<Text disabled strong>No Contacts</Text>} image={<ContactsOutlined />} /> }}
        rowKey={(record) => record.id || record.number}
        pagination={false}
        size="small"
        columns={column.filter(col => col.title.props.children !== "Action" || !editable)}
        style={{ cursor: "pointer", marginTop: "5vh" }}
        dataSource={dataSource}
      />
      <Form form={form} layout="vertical" style={{ marginTop: "3vh", display: !editable ? "" : "none" }}>
        <Row gutter={16}>
          <Col span={7}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: "Enter Name!" }]}>
              <Input maxLength={30} placeholder="Name" disabled={editable} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="designation" label="Designation">
              <Input maxLength={30} placeholder="Designation" disabled={editable} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="number" label="Phone Number" rules={[{ required: true, message: "Enter Phone!" }]}>
              <Input placeholder="Phone Number" disabled={editable} addonBefore="+91" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Button type="primary" style={{ marginTop: "42px" }} onClick={addData}>Save</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default SupplierContacts;
