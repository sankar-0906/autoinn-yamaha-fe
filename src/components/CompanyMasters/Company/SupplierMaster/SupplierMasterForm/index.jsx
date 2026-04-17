
/*eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { BankOutlined, ContactsOutlined, HomeOutlined } from '@ant-design/icons';

import {
  Button,
  message,
  Modal,
  Typography,
  Steps,
  Form
} from 'antd';
import _ from 'lodash';
import axiosInstance from "../../../../../api/axiosInstance";
import SupplierData from './SupplierData';
import SupplierContacts from './SupplierContacts';
import BankDetails from './BankDetails';

const { Step } = Steps;
const { Text } = Typography;

function SupplierMasterForm({
  open, close, values,
  editable, setValues,
  dataSource, setDataSource,
  setCount, count,
  setDelData, delData,
  setBankDelData, delbankData,
  supData, setSupData
}) {
  const [dataForm] = Form.useForm();
  const [contactsForm] = Form.useForm();
  const [bankForm] = Form.useForm();

  const ChildRef = useRef();
  const ClearRef = useRef();

  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({})
  const [error, setError] = useState({});

  const icons = [
    <HomeOutlined style={{ fontSize: "1rem" }} key={1} />,
    <ContactsOutlined style={{ fontSize: "1rem" }} key={2} />,
    <BankOutlined style={{ fontSize: "1rem" }} key={3} />
  ];

  const steps = [
    { id: 1, title: "Supplier Data" },
    { id: 2, title: "Supplier Contacts" },
    { id: 3, title: "Bank Details" },
  ];

  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (values) {
      setData(values)
    }
  }, [values])
  useEffect(() => {
    if (supData) {
      axiosInstance.get(`/supplier/${supData}`)
        .then((res) => {
          const { data } = res;
          if (data.success) {
            setData(data.data);
          } else {
            message.error('Cannot fetch Supplier Data');
          }
        })
        .catch((err) => {
          console.error('Supplier fetch error', err);
          message.error('Cannot fetch Supplier Data');
        });
    }
  }, [supData])


  const forms = [
    <SupplierData
      form={dataForm}
      data={data}
      setData={setData}
      editable={editable}
      validityRef={ChildRef}
      clearRef={ClearRef}
      error={error}
      setError={setError}
    />,
    <SupplierContacts
      form={contactsForm}
      data={data}
      setData={setData}
      values={values}
      editable={editable}
      validityRef={ChildRef}
      clearRef={ClearRef}
      error={error}
      setError={setError}
      setDelData={setDelData}
      delData={delData}
    />,
    <BankDetails
      form={bankForm}
      data={data}
      setData={setData}
      values={values}
      editable={editable}
      validityRef={ChildRef}
      clearRef={ClearRef}
      error={error}
      setError={setError}
      setBankDelData={setBankDelData}
      delbankData={delbankData}
    />

  ]


  const clearFields = () => {
    if (!supData) {
      setData({});
      setCurrent(0);
      ClearRef.current();
      setValues(null)
      setDelData([]);
      setBankDelData([]);
      close()
      setError({})
    }
    else {
      setData({});
      setCurrent(0);
      ClearRef.current();
      close()
      setError({})
    }
  };




  const handleSubmit = () => {
    if (!values) {
      setConfirmLoading(true);
      // Structured data is already in the 'data' state from validatePage
      axiosInstance.post('/supplier', data)
        .then((res) => {
          const previousData = dataSource;
          previousData.push(res.data.data);
          setDataSource(previousData);
          setCount(count + 1);
          message.success("Successfully Supplier Created");
          close();
          clearFields()
        })
        .catch((err) => {
          message.error('Supplier Data not Uploaded');
          console.error('Supplier creation Error:', err);
        });
    } else if (!editable) {
      data.id = values.id;
      if (data.GSTIN === undefined) {
        data.GSTIN = ''
      }
      if (delData && delData.length > 0) {
        for (let i = 0; i < delData.length; i++) {
          const ele = delData[i];
          axiosInstance.delete(`/supplier/phone/${ele.id}`).then((res) => {
            if (res.data.success) {
              message.success("Mobile number is Deleted Successfully");
            } else {
              message.error("Phone number is not deleted");
            }
          });
        }
      }
      if (delbankData && delbankData.length > 0) {
        for (let i = 0; i < delbankData.length; i++) {
          axiosInstance.delete(`/supplier/bank/${delbankData[i].id}`).then((res) => {
            if (res.data.success) {
              message.success("Account number is Deleted Successfully");
            } else {
              message.error("Account number is not deleted");
            }
          });
        }
      }
      axiosInstance.put(`/supplier/${values.id}`, data)
        .then((res) => {
          if (res.data.success) {
            close()
            const data = dataSource;
            dataSource.some((obj, index) => {
              if (obj.id === res.data.data.id) {
                data[index] = res.data.data;
              }
            });
            setDataSource([]);
            setDataSource(data);
            message.success('Supplier Saved Successfully');
            clearFields();
          } else {
            message.error('Supplier save Failed');
          }
        })
        .catch((err) => {
          message.error('Supplier Not Saved');
        });
    }

    setConfirmLoading(false)
  };

  return (
    <Modal
      width="60%"
      confirmLoading={confirmLoading}
      title="Supplier Master"
      open={open}
      onCancel={() => {
        clearFields();
      }}
      footer={[
        <Button
          onClick={() => {
            current > 0 ? setCurrent(current - 1) : clearFields();
          }}
        >
          {current > 0 ? "Previous" : "Cancel"}
        </Button>,
        <Button
          onClick={() => {
            if (ChildRef.current())
              current < 2 ? setCurrent(current + 1) : (editable ? clearFields() : handleSubmit());
          }}
          type="primary"
        >
          {current < 2 ? "Next" : (editable ? "Cancel" : "Save")}
        </Button>
      ]}
    >
      <div>
        <Steps size="small" type="navigation" current={current}>
          {steps.map((step, index) => (
            <Step
              key={step.id}
              icon={icons[index]}
              title={<Text>{step.title}</Text>}
            />
          ))}
        </Steps>
        <div>{forms[current]}</div>

      </div>
    </Modal>
  );
}
export default SupplierMasterForm;
