import React, { useState, useEffect } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  message,
  Select,
  Checkbox,
  Row,
  Col,
  Divider
} from 'antd';
import axiosInstance from "../../../../../../api/axiosInstance";
import { formatValue } from "../../../../../../utils";

function SupplierData({ form, validityRef, data, clearRef, editable, setData, error, setError }) {
  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [booleanstate, setbooleanstate] = useState(true);
  const [booleancity, setbooleancity] = useState(true);

  const [shippingState, setShippingState] = useState([]);
  const [shippingCity, setShippingCity] = useState([]);
  const [shippingBooleanstate, setShippingBooleanstate] = useState(true);
  const [shippingBooleancity, setShippingBooleancity] = useState(true);

  const [gstType, setGstType] = useState(false);
  const [gstName, setGstName] = useState('');
  const [gstStatus, setGstStatus] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Watch billing address fields for "same as billing" logic
  const billingLine1 = Form.useWatch(['address', 'line1'], form);
  const billingLine2 = Form.useWatch(['address', 'line2'], form);
  const billingLine3 = Form.useWatch(['address', 'line3'], form);
  const billingLocality = Form.useWatch(['address', 'locality'], form);
  const billingPincode = Form.useWatch(['address', 'pincode'], form);
  const billingCountry = Form.useWatch(['address', 'country'], form);
  const billingState = Form.useWatch(['address', 'state'], form);
  const billingDistrict = Form.useWatch(['address', 'district'], form);

  useEffect(() => {
    if (sameAsBilling) {
      form.setFieldsValue({
        shippingLine1: billingLine1,
        shippingLine2: billingLine2,
        shippingLine3: billingLine3,
        shippingLocality: billingLocality,
        shippingPincode: billingPincode,
        shippingCountry: billingCountry,
        shippingState: billingState,
        shippingDistrict: billingDistrict,
      });

      // Fetch states/cities for shipping if needed
      if (billingCountry && shippingState.length === 0) {
        fetchStates(billingCountry, 'shipping');
      }
      if (billingState && shippingCity.length === 0) {
        fetchCities(billingState, 'shipping');
      }
    }
  }, [sameAsBilling, billingLine1, billingLine2, billingLine3, billingLocality, billingPincode, billingCountry, billingState, billingDistrict]);

  useEffect(() => {
    // Initial fetch for countries
    axiosInstance.get('/location/countries')
      .then((res) => setCountry(res.data.data))
      .catch((err) => {
        message.error("Couldn't fetch Countries");
        console.error('Countries fetch error:', err);
      });

    // If editing existing data
    if (data && data.name) {
      const addr = data.address || {};
      const shipAddr = data.shippingAddress || {};

      if (addr.country?.id) fetchStates(addr.country.id, 'billing');
      if (addr.state?.id) fetchCities(addr.state.id, 'billing');

      if (shipAddr.country?.id) fetchStates(shipAddr.country.id, 'shipping');
      if (shipAddr.state?.id) fetchCities(shipAddr.state.id, 'shipping');

      if (data.dealerType === "UnregisteredDealer") {
        setGstType(true);
      }

      // Check if shipping matches billing (with null guards)
      const isSame = !!data.shippingAddress &&
        shipAddr.line1 === addr.line1 &&
        shipAddr.line2 === addr.line2 &&
        shipAddr.line3 === addr.line3 &&
        shipAddr.locality === addr.locality &&
        shipAddr.pincode === addr.pincode &&
        shipAddr.country?.id === addr.country?.id &&
        shipAddr.state?.id === addr.state?.id &&
        shipAddr.district?.id === addr.district?.id;

      setSameAsBilling(isSame);

      form.setFieldsValue({
        ...data,
        address: {
          ...addr,
          country: addr.country?.id,
          state: addr.state?.id,
          district: addr.district?.id
        },
        shippingLine1: shipAddr.line1,
        shippingLine2: shipAddr.line2,
        shippingLine3: shipAddr.line3,
        shippingLocality: shipAddr.locality,
        shippingPincode: shipAddr.pincode,
        shippingCountry: shipAddr.country?.id,
        shippingState: shipAddr.state?.id,
        shippingDistrict: shipAddr.district?.id,
      });
    }

    clearRef.current = () => {
      setGstName('');
      setGstStatus('');
      setSameAsBilling(false);
      form.resetFields();
    };

    validityRef.current = () => validatePage();

    return () => {
      validityRef.current = null;
      clearRef.current = null;
    };
  }, [data]);

  const fetchStates = (id, type) => {
    if (!id) return;
    axiosInstance.get(`/location/states/${id}`).then(res => {
      if (type === 'billing') {
        setState(res.data.data);
        setbooleanstate(false);
      } else {
        setShippingState(res.data.data);
        setShippingBooleanstate(false);
      }
    }).catch(err => console.error('State fetch error:', err));
  };

  const fetchCities = (id, type) => {
    axiosInstance.get(`/location/cities/${id}`).then(res => {
      if (type === 'billing') {
        setCity(res.data.data);
        setbooleancity(false);
      } else {
        setShippingCity(res.data.data);
        setShippingBooleancity(false);
      }
    }).catch(err => console.error('City fetch error:', err));
  };

  const checkGST = (gst) => {
    axiosInstance.post('/gstVerify', { gst })
      .then(res => {
        const { data } = res;
        // The backend returns { success: true, data: { taxpayerInfo: ..., error: ... } }
        if (data.success && data.data && !data.data.error) {
          const info = data.data.taxpayerInfo;
          if (info.sts === 'Active') {
            message.success('GST Verified');
            setGstName(info.tradeNam);
            setGstStatus(info.sts);
            const newError = { ...error };
            delete newError.GST;
            setError(newError);
          } else {
            message.warning('GSTIN is Inactive');
            setGstName(info.tradeNam);
            setGstStatus(info.sts);
            setError({
              ...error,
              GST: { type: 'error', message: `The GSTIN entered is ${info.sts}` }
            });
          }
        } else {
          message.error('GST Invalid');
          setGstName('');
          setGstStatus('');
          setError({ ...error, GST: { type: 'error', message: 'Enter Valid GSTIN' } });
        }
      })
      .catch(err => {
        console.error('GST Verification error:', err);
        message.error('GST Verification Failed');
      });
  };

  const validatePage = async () => {
    try {
      const allData = await form.validateFields();

      const billingAddress = {
        line1: allData.address.line1,
        line2: allData.address.line2,
        line3: allData.address.line3,
        locality: allData.address.locality,
        pincode: allData.address.pincode,
        country: { id: allData.address.country },
        state: { id: allData.address.state },
        district: { id: allData.address.district },
      };

      let shippingAddressData = {};
      if (sameAsBilling) {
        shippingAddressData = { ...billingAddress };
      } else {
        shippingAddressData = {
          line1: allData.shippingLine1,
          line2: allData.shippingLine2,
          line3: allData.shippingLine3,
          locality: allData.shippingLocality,
          pincode: allData.shippingPincode,
          country: allData.shippingCountry ? { id: allData.shippingCountry } : null,
          state: allData.shippingState ? { id: allData.shippingState } : null,
          district: allData.shippingDistrict ? { id: allData.shippingDistrict } : null,
        };
      }

      const finalData = {
        ...data,
        ...allData,
        address: billingAddress,
        shippingAddress: shippingAddressData,
        supplierType: allData.supplierType || []
      };

      setData(finalData);
      return true;
    } catch (err) {
      console.error('Validation failed:', err);
      return false;
    }
  };

  return (
    <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Supplier Name"
            rules={[{ required: true, message: 'Enter Supplier Name!' }]}
          >
            <Input
              placeholder="Supplier Name"
              disabled={editable}
              onChange={e => form.setFieldValue("name", formatValue(e, "allCaps"))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="dealerType"
            label="GST Dealer Type"
            rules={[{ required: true, message: 'Select GST Dealer Type!' }]}
          >
            <Select
              placeholder="GST Dealer Type"
              disabled={editable}
              onChange={val => {
                const isUnreg = val === 'UnregisteredDealer';
                setGstType(isUnreg);
                if (isUnreg) form.setFieldValue("GSTIN", undefined);
              }}
            >
              <Select.Option value="RegisteredDealer">Registered Dealer</Select.Option>
              <Select.Option value="UnregisteredDealer">Unregistered Dealer</Select.Option>
              <Select.Option value="UINHolder">UIN Holder</Select.Option>
              <Select.Option value="CompositionDealer">Composition Dealer</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Select Status!' }]}
          >
            <Select placeholder="Status" disabled={editable}>
              <Select.Option value="ACTIVE">Active</Select.Option>
              <Select.Option value="INACTIVE">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="GSTIN"
            label="GSTIN"
            validateStatus={error.GST && error.GST.type}
            help={error.GST && error.GST.message}
            rules={[{ required: !gstType, message: 'Enter GST number!' }]}
          >
            <Input
              placeholder="GSTIN"
              maxLength={15}
              disabled={editable || gstType}
              onChange={e => {
                const val = formatValue(e, 'toUpperCase');
                form.setFieldValue("GSTIN", val);
                if (val.length === 15) checkGST(val);
              }}
            />
          </Form.Item>
          {gstName && (
            <div style={{ color: 'green', fontSize: '12px', marginTop: '-20px', marginBottom: '10px' }}>
              <CheckCircleOutlined /> {gstName} ({gstStatus})
            </div>
          )}
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Enter valid Email!' }]}
          >
            <Input
              placeholder="Email"
              disabled={editable}
              onChange={e => form.setFieldValue("email", formatValue(e, "toLowerCase"))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="supplierType"
            label="Supplier Type"
            rules={[{ required: true, message: 'Select Supplier Type!' }]}
          >
            <Select
              placeholder="Supplier Type"
              disabled={editable}
              mode="multiple"
            >
              <Select.Option value="Vehicles">Vehicles</Select.Option>
              <Select.Option value="Accessories">Accessories</Select.Option>
              <Select.Option value="Spares">Spares</Select.Option>
              <Select.Option value="Battery">Battery</Select.Option>
              <Select.Option value="Tyre">Tyre</Select.Option>
              <Select.Option value="Consumables">Consumables</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 15 }}>Billing Address</div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={['address', 'line1']} label="Address Line 1" rules={[{ required: true }]}>
            <Input
              placeholder="Address Line 1"
              disabled={editable}
              onChange={e => form.setFieldValue(['address', 'line1'], formatValue(e, "allCaps"))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['address', 'line2']} label="Address Line 2">
            <Input
              placeholder="Address Line 2"
              disabled={editable}
              onChange={e => form.setFieldValue(['address', 'line2'], formatValue(e, "allCaps"))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={['address', 'line3']} label="Address Line 3">
            <Input
              placeholder="Address Line 3"
              disabled={editable}
              onChange={e => form.setFieldValue(['address', 'line3'], formatValue(e, "allCaps"))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['address', 'locality']} label="Locality" rules={[{ required: true }]}>
            <Input
              placeholder="Locality"
              disabled={editable}
              onChange={e => form.setFieldValue(['address', 'locality'], formatValue(e, "allCaps"))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name={['address', 'country']} label="Country" rules={[{ required: true }]}>
            <Select
              placeholder="Country"
              disabled={editable}
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              onSelect={val => fetchStates(val, 'billing')}
            >
              {country.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name={['address', 'state']} label="State" rules={[{ required: true }]}>
            <Select
              placeholder="State"
              disabled={editable || booleanstate}
              showSearch
              onSelect={val => fetchCities(val, 'billing')}
            >
              {state.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name={['address', 'district']} label="City" rules={[{ required: true }]}>
            <Select placeholder="City" disabled={editable || booleancity} showSearch>
              {city.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name={['address', 'pincode']} label="Pincode" rules={[{ required: true }]}>
            <Input
              placeholder="Pincode"
              disabled={editable}
              maxLength={6}
              onChange={e => form.setFieldValue(['address', 'pincode'], formatValue(e, "onlyNo"))}
            />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, marginTop: 20 }}>Shipping Address</div>
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Checkbox
            checked={sameAsBilling}
            onChange={e => setSameAsBilling(e.target.checked)}
            disabled={editable}
          >
            Shipping address same as Billing address
          </Checkbox>
        </Col>
      </Row>

      {!sameAsBilling && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippingLine1" label="Address Line 1" rules={[{ required: !sameAsBilling }]}>
                <Input
                  placeholder="Address Line 1"
                  disabled={editable}
                  onChange={e => form.setFieldValue("shippingLine1", formatValue(e, "allCaps"))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shippingLine2" label="Address Line 2">
                <Input
                  placeholder="Address Line 2"
                  disabled={editable}
                  onChange={e => form.setFieldValue("shippingLine2", formatValue(e, "allCaps"))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippingLine3" label="Address Line 3">
                <Input
                  placeholder="Address Line 3"
                  disabled={editable}
                  onChange={e => form.setFieldValue("shippingLine3", formatValue(e, "allCaps"))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shippingLocality" label="Locality" rules={[{ required: !sameAsBilling }]}>
                <Input
                  placeholder="Locality"
                  disabled={editable}
                  onChange={e => form.setFieldValue("shippingLocality", formatValue(e, "allCaps"))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="shippingCountry" label="Country" rules={[{ required: !sameAsBilling }]}>
                <Select
                  placeholder="Country"
                  disabled={editable}
                  showSearch
                  onSelect={val => fetchStates(val, 'shipping')}
                >
                  {country.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="shippingState" label="State" rules={[{ required: !sameAsBilling }]}>
                <Select
                  placeholder="State"
                  disabled={editable || shippingBooleanstate}
                  showSearch
                  onSelect={val => fetchCities(val, 'shipping')}
                >
                  {shippingState.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="shippingDistrict" label="City" rules={[{ required: !sameAsBilling }]}>
                <Select placeholder="City" disabled={editable || shippingBooleancity} showSearch>
                  {shippingCity.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="shippingPincode" label="Pincode" rules={[{ required: !sameAsBilling }]}>
                <Input
                  placeholder="Pincode"
                  disabled={editable}
                  maxLength={6}
                  onChange={e => form.setFieldValue("shippingPincode", formatValue(e, "onlyNo"))}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea
              placeholder="Remarks"
              disabled={editable}
              rows={2}
              onChange={e => form.setFieldValue("remarks", formatValue(e, "firstCaps"))}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default SupplierData;