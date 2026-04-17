import React, { useState, useEffect } from "react";
import { Row, Col, Select, Button, Input, message, Form } from 'antd';
import axiosInstance from "../../../../../api/axiosInstance";

const { Option } = Select;

function AdvancedFilters({
  form,
  filteropen,
  close,
  searchName,
  setId,
  id,
  setData,
  setPrimaryData
}) {
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [country, setCountry] = useState([]);
  const [contact, setContact] = useState([]);
  const [supplier, setSupplier] = useState([]);

  const statusOptions = [
    { id: "ACTIVE", name: "Active" },
    { id: "INACTIVE", name: "Inactive" },
  ];

  const Filters = [
    { id: "1", name: "Supplier Name" },
    { id: "2", name: "Status" },
    { id: "3", name: "Supplier Type" },
    { id: "4", name: "GST Dealer Type" },
    { id: "5", name: "State" },
    { id: "6", name: "City" },
    { id: "7", name: "Locality" },
    { id: "8", name: "Supplier Contact Name" },
    { id: "9", name: "Supplier Contact Cell Phone No" },
  ];

  const Type = [
    { id: "1", name: "Vehicles" },
    { id: "2", name: "Accessories" },
    { id: "3", name: "Spares" },
    { id: "4", name: "Battery" },
    { id: "5", name: "Tyre" },
    { id: "6", name: "Consumables" },
  ];

  const Dealer = [
    { key: "RegisteredDealer", name: "Registered Dealer" },
    { key: "UnregisteredDealer", name: "Unregistered Dealer" },
    { key: "UINHolder", name: "UIN Holder" },
    { key: "CompositionDealer", name: "Composition Dealer" },
  ];

  const selectFilter = (val) => {
    setId(val);
  };

  const clearFilters = () => {
    setId([]);
    form.resetFields();
    setPrimaryData();
  };

  const deleteFilter = (element) => {
    const changedfilter = id.filter(f => f !== element);
    setId(changedfilter);
    form.setFieldsValue({ selectfilter: changedfilter });
  };

  useEffect(() => {
    if (filteropen) {
      form.setFieldsValue({ selectfilter: id });

      axiosInstance.get("/supplier").then(res => {
        if (res.data.success) setSupplier(res.data.data.supplier || []);
      });

      axiosInstance.get("/location/countries").then(res => {
        if (res.data.success) setCountry(res.data.data || []);
      });
    }
  }, [filteropen]);

  useEffect(() => {
    if (id.includes("5")) {
      const india = country.find(c => c.name === "India");
      if (india) {
        axiosInstance.post("api/csc/states", { id: india.id }).then(res => {
          if (res.data.success) setState(res.data.data || []);
        });
      }
    }
    if (id.includes("8") || id.includes("9")) {
      const contacts = [];
      supplier.forEach(s => s.contact.forEach(c => contacts.push(c)));
      setContact(contacts);
    }
  }, [id, country, supplier]);

  const handleStateChange = (ids) => {
    axiosInstance.post("api/csc/cities", { id: ids }).then(res => {
      if (res.data.success) {
        setCity(res.data.data || []);
      }
    });
  };

  const handleSubmit = async () => {
    const values = form.getFieldsValue();
    const data = {
      name: values.name,
      status: values.status,
      stype: values.suppliertype,
      gstDealerType: values.GST,
      state: values.State,
      city: values.City,
      locality: values.Locality,
      scname: values.contactname,
      sphone: values.suppliercontactnumber
    };

    axiosInstance.post("/supplier/get", data).then(res => {
      const { data } = res;
      if (data.success) {
        setData(data.data.supplier);
        message.success("Filtered successfully");
      } else {
        message.error("Unable to filter data");
      }
    }).catch(err => {
      console.error("Filter Search Error:", err);
      message.error("Something went wrong while filtering");
    });
  };

  const renderFilterItem = (element) => {
    const filterMap = {
      "1": <Input placeholder="Name" />,
      "2": (
        <Select placeholder="Status">
          {statusOptions.map(s => <Option key={s.id} value={s.name}>{s.name}</Option>)}
        </Select>
      ),
      "3": (
        <Select placeholder="Supplier type" mode="multiple">
          {Type.map(t => <Option key={t.id} value={t.name}>{t.name}</Option>)}
        </Select>
      ),
      "4": (
        <Select placeholder="GST dealer type" mode="multiple">
          {Dealer.map(d => <Option key={d.key} value={d.key}>{d.name}</Option>)}
        </Select>
      ),
      "5": (
        <Select placeholder="State" mode="multiple" onChange={handleStateChange}>
          {state.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
        </Select>
      ),
      "6": (
        <Select placeholder="City" mode="multiple">
          {city.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
        </Select>
      ),
      "7": (
        <Select placeholder="Locality" mode="multiple">
          {supplier.map(s => <Option key={s.id} value={s.address.locality}>{s.address.locality}</Option>)}
        </Select>
      ),
      "8": (
        <Select placeholder="Contact Name">
          {contact.map((c, idx) => <Option key={idx} value={c.name}>{c.name}</Option>)}
        </Select>
      ),
      "9": (
        <Select placeholder="Supplier Number">
          {contact.map((c, idx) => <Option key={idx} value={c.number}>{c.number}</Option>)}
        </Select>
      ),
    };

    const nameMap = {
      "1": "name", "2": "status", "3": "suppliertype", "4": "GST",
      "5": "State", "6": "City", "7": "Locality", "8": "contactname", "9": "suppliercontactnumber"
    };

    return (
      <Col span={8} key={element}>
        <Row type="flex" align="middle">
          <Col span={20}>
            <Form.Item name={nameMap[element]} style={{ marginBottom: 8 }}>
              {filterMap[element]}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button type="text" shape="circle" size="small" onClick={() => deleteFilter(element)} style={{ marginLeft: 4 }}>
              &#10005;
            </Button>
          </Col>
        </Row>
      </Col>
    );
  };

  return (
    <div>
      {filteropen && (
        <div className="AdvancedFilters" style={{ background: '#f0f2f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Form form={form}>
            <Row gutter={16}>
              <Col span={14}>
                <Row gutter={[8, 8]}>
                  {id.map(element => renderFilterItem(element))}
                </Row>
              </Col>
              <Col span={10}>
                <Row gutter={8}>
                  <Col span={18}>
                    <Form.Item name="selectfilter">
                      <Select placeholder="Select the Filter" mode="multiple" onChange={selectFilter}>
                        {Filters.map(f => <Option key={f.id}>{f.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Button type="primary" onClick={handleSubmit} block>Search</Button>
                  </Col>
                </Row>
                <Row justify="end">
                  <Button onClick={clearFilters}>Clear</Button>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilters;
