import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Select, Divider, Table, Button, Popconfirm, Typography, InputNumber, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../api/axiosInstance';

const { Text } = Typography;

const LocationStep = ({ form, data, setData, editable, onContactsChange }) => {
    // Autoinn-style state management
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState({});
    const [gstInfo, setGstInfo] = useState({ name: '', status: '' });
    const [booleanState, setBooleanState] = useState(true);
    const [booleanCity, setBooleanCity] = useState(true);
    const [dataSource, setDataSource] = useState([]); // Autoinn-style contacts
    const [editPhone, setEditPhone] = useState(""); // Autoinn-style editing
    const lastInitializedId = React.useRef('uninitialized');

    useEffect(() => {
        // Fetch Countries
        axiosInstance.get('/location/countries').then(res => {
            if (res.data.success) {
                const fetchedCountries = res.data.data || [];
                setCountries(fetchedCountries);

                // Set India as default
                const india = fetchedCountries.find(c =>
                    c.name && c.name.toLowerCase() === 'india'
                );
                const defaultCountry = india || fetchedCountries[0];

                if (defaultCountry?.id) {
                    const currentCountry = form.getFieldValue(['address', 'country']);
                    if (!currentCountry) {
                        form.setFieldValue(['address', 'country'], defaultCountry.id);
                        fetchStates(defaultCountry.id);
                    }
                }
            }
        });

        // Fetch Manufacturers
        axiosInstance.get('/manufacturer').then(res => {
            if (res.data.success) setManufacturers(res.data.data.manufacturers || []);
        });

        // Fetch Employees
        axiosInstance.get('/user').then(res => {
            if (res.data.success) setEmployees(res.data.data.users || []);
        });
    }, []);

    useEffect(() => {
        // Prevent initialization with completely empty initial unpopulated object
        if (!data || Object.keys(data).length === 0) return;

        const currentDataId = data.id || 'new';

        // Only run initialization when we're loading a new branch context
        if (lastInitializedId.current !== currentDataId) {
            lastInitializedId.current = currentDataId;

            // Autoinn-style: Set dataSource from contacts
            if (data.contacts) {
                setDataSource(data.contacts);
            }

            if (data.address?.country) {
                fetchStates(data.address.country);
                setBooleanState(false);
            }
            if (data.address?.state) {
                fetchCities(data.address.state);
                setBooleanCity(false);
            }

            const updateFormValue = (field, value) => {
                const currentValue = form.getFieldValue(field);
                if (value !== undefined && currentValue !== value) {
                    form.setFieldValue(field, value);
                }
            };

            updateFormValue('name', data.name);
            updateFormValue('email', data.email);
            updateFormValue('url', data.url);
            updateFormValue('googleMapUrl', data.googleMapUrl);
            updateFormValue('lat', data.lat);
            updateFormValue('lon', data.lon);
            updateFormValue('manufacturer', data.manufacturer);
            updateFormValue('personInCharge', data.personInCharge);
            updateFormValue('gst', data.gst);

            // Set nested address fields - only if data exists
            if (data.address) {
                updateFormValue(['address', 'line1'], data.address.line1);
                updateFormValue(['address', 'line2'], data.address.line2);
                updateFormValue(['address', 'line3'], data.address.line3);
                updateFormValue(['address', 'locality'], data.address.locality);
                updateFormValue(['address', 'pincode'], data.address.pincode);
                updateFormValue(['address', 'country'], data.address.country);
                updateFormValue(['address', 'state'], data.address.state);
                updateFormValue(['address', 'district'], data.address.district);
            }
        }
    }, [data, form]);

    // Autoinn-style: Pass contacts to parent when dataSource changes
    useEffect(() => {
        if (onContactsChange) {
            onContactsChange(dataSource);
        }
    }, [dataSource, onContactsChange]);

    const fetchStates = (countryId) => {
        axiosInstance.get(`/location/states/${countryId}`).then(res => {
            if (res.data.success) {
                setStates(res.data.data);
                setBooleanState(false);
                // Autoinn-style: Only clear state if country changed
                const currentCountry = form.getFieldValue(['address', 'country']);
                const currentState = form.getFieldValue(['address', 'state']);

                if (currentCountry !== countryId) {
                    form.setFieldValue(['address', 'state'], undefined);
                    form.setFieldValue(['address', 'district'], undefined);
                }
            }
        });
    };

    const fetchCities = (stateId) => {
        axiosInstance.get(`/location/cities/${stateId}`).then(res => {
            if (res.data.success) {
                setCities(res.data.data);
                setBooleanCity(false);
                // Autoinn-style: Only clear district if state changed
                const currentState = form.getFieldValue(['address', 'state']);
                const currentDistrict = form.getFieldValue(['address', 'district']);

                if (currentState !== stateId) {
                    form.setFieldValue(['address', 'district'], undefined);
                }
            }
        });
    };

    const checkGST = (gst) => {
        if (gst.length === 15) {
            // GST verification API call - matches autoinn behavior exactly
            axiosInstance.post('/gstVerify', { gst }).then(res => {
                let { data } = res;
                if (data.code === 200) {
                    let { response } = data;
                    if (response.code === 200) {
                        if (response.data.data.error) {
                            message.error("GST Invalid");
                            setGstInfo({ name: '', status: '' });
                            setError(prev => ({
                                ...prev,
                                GST: { type: 'error', message: 'GST Invalid' }
                            }));
                            return false;
                        } else {
                            message.success("GST Verified");
                            setError(prev => {
                                const newError = { ...prev };
                                delete newError.GST;
                                return newError;
                            });
                            setGstInfo({
                                name: response.data.data.taxpayerInfo.tradeNam,
                                status: response.data.data.taxpayerInfo.sts
                            });
                            return true;
                        }
                    }
                }
            }).catch((error) => {
                // Handle API errors - no mock data, only real API calls
                console.error('GST verification error:', error);

                if (error.response?.status === 400) {
                    message.error("GST Invalid");
                    setGstInfo({ name: '', status: '' });
                    setError(prev => ({
                        ...prev,
                        GST: { type: 'error', message: 'GST Invalid' }
                    }));
                } else if (error.response?.status === 429) {
                    message.error("GST verification service temporarily unavailable");
                    setGstInfo({ name: '', status: '' });
                    setError(prev => ({
                        ...prev,
                        GST: { type: 'error', message: 'Service temporarily unavailable' }
                    }));
                } else {
                    message.error("GST verification service unavailable");
                    setGstInfo({ name: '', status: '' });
                    setError(prev => ({
                        ...prev,
                        GST: { type: 'error', message: 'Service unavailable' }
                    }));
                }
            });
        } else if (gst.length < 15) {
            // Clear GST info when typing
            setGstInfo({ name: '', status: '' });
            setError(prev => {
                const newError = { ...prev };
                delete newError.GST;
                return newError;
            });
        }
    };

    const validateField = (field, value, pattern, errorMessage) => {
        if (pattern && !pattern.test(value)) {
            setError(prev => ({ ...prev, [field]: { type: 'error', message: errorMessage } }));
        } else {
            setError(prev => {
                const newError = { ...prev };
                delete newError[field];
                return newError;
            });
        }
    };

    // Autoinn-style contact functions
    const editingPhone = () => {
        try {
            if (
                (form.getFieldValue("phone").length === 10 ||
                    form.getFieldValue("phone").length === 11) &&
                !error.PNO
            ) {
                const obj = {
                    phone: form.getFieldValue("phone"),
                    category: form.getFieldValue("category"),
                    id: editPhone,
                };
                let i = 0;
                dataSource.map((element, index) => {
                    if (element.id === editPhone) {
                        i = index;
                    }
                });
                setDataSource([]);
                const data = dataSource;
                data[i] = obj;
                setDataSource(data);
                form.setFieldValue('phone', undefined);
                form.setFieldValue('category', undefined);
                setEditPhone("");
            } else {
                message.error("Enter Valid Phone Number");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const editContact = (contact) => {
        // Autoinn-style: populate form fields and set editPhone
        form.setFieldValue('phone', contact.phone);
        form.setFieldValue('category', contact.category);
        setEditPhone(contact.phone);
    };

    const removeContact = (index) => {
        const newDataSource = [...dataSource];
        newDataSource.splice(index, 1);
        setDataSource(newDataSource);
    };

    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    const formatValue = (e, type) => {
        const value = e.target.value;
        switch (type) {
            case 'titleCase':
                return toTitleCase(value);
            case 'onlyNo':
                return value.replace(/[^0-9]/g, '');
            case 'toUpperCase':
                return value.toUpperCase();
            default:
                return value;
        }
    };


    const contactColumns = [
        {
            title: <Text strong>Phone Number</Text>,
            dataIndex: 'phone',
            key: 'phone',
            render: (record) => <span>{record}</span>
        },
        {
            title: <Text strong>Category</Text>,
            dataIndex: 'category',
            key: 'category',
            render: (record) => <span>{record}</span>
        },
        {
            title: <Text strong>Action</Text>,
            key: 'action',
            render: (_, record, index) => (
                editable ? (
                    <div>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => editContact(record)}
                        />
                        <Popconfirm title="Remove contact?" onConfirm={() => removeContact(index)}>
                            <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </div>
                ) : null
            )
        }
    ];

    return (
        <Form
            form={form}
            layout="vertical"
            disabled={!editable}
            onValuesChange={(changedValues, allValues) => {
                // Update parent data when form values change
                setData(prev => ({ ...prev, ...allValues }));
            }}
        >
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="name"
                        label="Branch Name"
                        validateStatus={error.NAME && error.NAME.type}
                        help={error.NAME && error.NAME.message}
                        rules={[{ required: true, message: 'Enter Branch Name!' }]}
                    >
                        <Input
                            placeholder="Branch Name"
                            disabled={!editable}
                            onKeyUp={(e) => form.setFieldValue('name', formatValue(e, 'titleCase'))}
                            pattern="^[A-Z][a-zA-Z.\s]*[a-zA-Z.]+$"
                            onInput={(e) => validateField('NAME', e.target.value, /^[A-Z][a-zA-Z.\s]*[a-zA-Z.]+$/, 'Enter Valid Name')}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Divider titlePlacement="left">Address</Divider>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={['address', 'line1']}
                        label="Address Line 1"
                        validateStatus={error.address && error.address.type}
                        help={error.address && error.address.message}
                        rules={[{ required: true, message: 'Enter Address Line 1!' }]}
                    >
                        <Input
                            placeholder="Address Line 1"
                            disabled={!editable}
                            maxLength={50}
                            pattern="^([a-zA-Z0-9\-/,]+[ \-/,])*\w+.?$"
                            onKeyUp={(e) => form.setFieldValue(['address', 'line1'], formatValue(e, 'titleCase'))}
                            onInput={(e) => validateField('address', e.target.value, /^([a-zA-Z0-9\-/,]+[ \-/,])*\w+.?$/, 'Enter Valid Address Line1')}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={['address', 'line2']}
                        label="Address Line 2"
                        rules={[{ required: false }]}
                    >
                        <Input
                            placeholder="Address Line 2"
                            disabled={!editable}
                            maxLength={50}
                            pattern="^([a-zA-Z0-9\-/,]+[ \-/,])*\w+.?$"
                            onKeyUp={(e) => form.setFieldValue(['address', 'line2'], formatValue(e, 'titleCase'))}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={['address', 'locality']}
                        label="Locality"
                        validateStatus={error.locality && error.locality.type}
                        help={error.locality && error.locality.message}
                        rules={[{ required: true, message: 'Enter Locality!' }]}
                    >
                        <Input
                            placeholder="Locality"
                            disabled={!editable}
                            maxLength={50}
                            pattern="^([a-zA-Z0-9\-/,]+[ \-/,])*\w+.?$"
                            onKeyUp={(e) => form.setFieldValue(['address', 'locality'], formatValue(e, 'titleCase'))}
                            onInput={(e) => validateField('locality', e.target.value, /^([a-zA-Z0-9\-/,]+[ \-/,])*\w+.?$/, 'Enter Valid Locality')}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item
                        name={['address', 'country']}
                        label="Country"
                        rules={[{ required: true, message: 'Select Country!' }]}
                    >
                        <Select
                            placeholder="Country"
                            disabled={!editable}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onSelect={(val) => {
                                fetchStates(val);
                                form.setFieldValue(['address', 'state'], undefined);
                                form.setFieldValue(['address', 'district'], undefined);
                            }}
                        >
                            {countries?.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={['address', 'state']}
                        label="State"
                        rules={[{ required: true, message: 'Select State!' }]}
                    >
                        <Select
                            placeholder="State"
                            disabled={!editable || booleanState}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onSelect={(val) => {
                                fetchCities(val);
                                form.setFieldValue(['address', 'district'], undefined);
                            }}
                        >
                            {states?.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={['address', 'district']}
                        label="City"
                        rules={[{ required: true, message: 'Select City!' }]}
                    >
                        <Select
                            placeholder="City"
                            disabled={!editable || booleanCity}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {cities?.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name={['address', 'pincode']}
                        label="Pincode"
                        validateStatus={error.PIN && error.PIN.type}
                        help={error.PIN && error.PIN.message}
                        rules={[{ required: true, message: 'Enter Pincode!' }]}
                    >
                        <Input
                            placeholder="Pincode"
                            disabled={!editable}
                            maxLength={7}
                            pattern="([0-9]{6}|[0-9]{3}\s[0-9]{3})"
                            onKeyUp={(e) => form.setFieldValue(['address', 'pincode'], formatValue(e, 'onlyNo'))}
                            onInput={(e) => validateField('PIN', e.target.value, /([0-9]{6}|[0-9]{3}\s[0-9]{3})/, 'Enter Valid PIN Code')}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Divider titlePlacement="left">Contacts</Divider>
            {editable && (
                <Row gutter={16} align="bottom" style={{ marginBottom: '16px' }}>
                    <Col span={9}>
                        <Form.Item
                            label={<Text strong>Phone</Text>}
                            colon={false}
                            required
                            validateStatus={error.PNO && error.PNO.type}
                            help={error.PNO && error.PNO.message}
                        >
                            <Form.Item
                                name="phone"
                                noStyle
                            >
                                <Input
                                    placeholder="Phone Number"
                                    addonBefore="+91"
                                    maxLength={11}
                                    pattern="^[0-9]{10,11}$"
                                    onKeyUp={(e) => form.setFieldValue('phone', formatValue(e, 'onlyNo'))}
                                    onChange={(event) => {
                                        if (!event.target.checkValidity()) {
                                            setError({
                                                ...error,
                                                PNO: {
                                                    type: 'error',
                                                    message: 'Enter Valid Phone Number!',
                                                },
                                            });
                                        } else {
                                            delete error.PNO;
                                            setError({ ...error });
                                        }
                                        if (dataSource.length > 0) {
                                            if (event.target.checkValidity()) {
                                                for (let i = 0; i < dataSource.length; i++) {
                                                    if (dataSource[i].phone == event.target.value) {
                                                        setError({
                                                            ...error,
                                                            PNO: {
                                                                type: 'error',
                                                                message: 'Phone Number already exists',
                                                            },
                                                        });
                                                        return;
                                                    }
                                                }
                                                delete error.PNO;
                                                setError({ ...error });
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Form.Item>
                    </Col>
                    <Col span={9}>
                        <Form.Item
                            label={<Text strong>Category</Text>}
                            colon={false}
                            required
                        >
                            <Form.Item name="category" noStyle>
                                <Select
                                    placeholder="Category"
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="Sales">Sales</Select.Option>
                                    <Select.Option value="Service">Service</Select.Option>
                                    <Select.Option value="Spares">Spares</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label=" "
                            colon={false}
                        >
                            {!editPhone ? (
                                <Button
                                    type="primary"
                                    block
                                    onClick={() => {
                                        if (
                                            form.getFieldValue("phone") &&
                                            (form.getFieldValue("phone").length === 10 ||
                                                form.getFieldValue("phone").length === 11) &&
                                            !error.PNO &&
                                            form.getFieldValue("category")
                                        ) {
                                            const obj = {
                                                id: "",
                                                phone: form.getFieldValue("phone"),
                                                category: form.getFieldValue("category"),
                                            };
                                            setDataSource([...dataSource, obj]);
                                            form.setFieldValue('phone', undefined);
                                            form.setFieldValue('category', undefined);
                                            if (error.CON) {
                                                delete error.CON;
                                                setError({ ...error });
                                            }
                                        } else {
                                            message.error("Enter valid Phone number or Category");
                                        }
                                    }}
                                >
                                    Add Contact
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    block
                                    onClick={() => editingPhone()}
                                >
                                    Save
                                </Button>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            )}
            <Form.Item
                label={<Text><span style={{ color: 'red' }}> * </span>Contacts</Text>}
                validateStatus={error.CON && error.CON.type}
                help={error.CON && error.CON.message}
            >
                <Table
                    dataSource={dataSource}
                    columns={contactColumns}
                    pagination={false}
                    size="small"
                    locale={{
                        emptyText: (
                            <Empty
                                imageStyle={{ height: 25, fontSize: 30 }}
                                description={<Text disabled strong>No Contacts</Text>}
                            />
                        ),
                    }}
                    style={{ marginBottom: '24px' }}
                />
            </Form.Item>

            <Divider titlePlacement="left">Associations & Details</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="manufacturer" label="Manufacturers">
                        <Select mode="multiple" placeholder="Select Manufacturers">
                            {manufacturers?.map(m => <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="personInCharge" label="Person In Charge">
                        <Select mode="multiple" placeholder="Select Employees">
                            {employees?.map(e => (
                                <Select.Option key={e.id} value={e.id}>
                                    {e.profile?.employeeName || e.employeeName || e.name || e.email}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="email"
                        label="Email"
                        validateStatus={error.EMAIL && error.EMAIL.type}
                        help={error.EMAIL && error.EMAIL.message}
                        rules={[{ type: 'email', message: 'Enter Valid Email!' }]}
                    >
                        <Input
                            placeholder="Branch Email"
                            disabled={!editable}
                            pattern='^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
                            onInput={(e) => validateField('EMAIL', e.target.value, /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Enter Valid Email')}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="gst"
                        label="GSTIN"
                        validateStatus={error.GST && error.GST.type}
                        help={error.GST && error.GST.message}
                        rules={[{ required: true, message: 'Enter GSTIN!' }]}
                    >
                        <Input
                            placeholder="GSTIN"
                            disabled={!editable}
                            maxLength={15}
                            onKeyUp={(e) => form.setFieldValue('gst', formatValue(e, 'toUpperCase'))}
                            onInput={(event) => {
                                const value = event.target.value;
                                if (value.length === 15) {
                                    let flag = checkGST(value);
                                    // Note: checkGST is async, so we handle the result in the function
                                } else if (gstInfo.status && gstInfo.status !== "Active") {
                                    setGstInfo({ name: '', status: '' });
                                    setError(prev => ({
                                        ...prev,
                                        GST: {
                                            type: "error",
                                            message: "The GSTIN entered is Inactive",
                                        },
                                    }));
                                } else {
                                    setGstInfo({ name: '', status: '' });
                                    setError(prev => ({
                                        ...prev,
                                        GST: {
                                            type: "error",
                                            message: "Enter Valid GSTIN",
                                        },
                                    }));
                                }
                            }}
                        />
                    </Form.Item>
                    {gstInfo.name && (
                        <Row type="flex" align="middle" style={{ marginTop: '2px', marginBottom: '4px' }}>
                            <CheckCircleOutlined
                                style={{ fontSize: 18, marginRight: '8px' }}
                                twoToneColor="#52c41a"
                            />
                            <span style={{ color: '#52c41a', fontSize: '12px' }}>
                                {gstInfo.name} ({gstInfo.status})
                            </span>
                        </Row>
                    )}
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="lat"
                        label="Latitude"
                        validateStatus={error.LAT && error.LAT.type}
                        help={error.LAT && error.LAT.message}
                        rules={[{ required: true, message: 'Enter Latitude!' }]}
                    >
                        <Input
                            placeholder="Enter Latitude"
                            disabled={!editable}
                            type="number"
                            step="0.000001"
                            onInput={(e) => {
                                const value = parseFloat(e.target.value);
                                if (isNaN(value) || value < -90 || value > 90) {
                                    setError({
                                        ...error,
                                        LAT: { type: 'error', message: 'Latitude must be between -90 and 90' }
                                    });
                                } else {
                                    delete error.LAT;
                                    setError({ ...error });
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="lon"
                        label="Longitude"
                        validateStatus={error.LON && error.LON.type}
                        help={error.LON && error.LON.message}
                        rules={[{ required: true, message: 'Enter Longitude!' }]}
                    >
                        <Input
                            placeholder="Enter Longitude"
                            disabled={!editable}
                            type="number"
                            step="0.000001"
                            onInput={(e) => {
                                const value = parseFloat(e.target.value);
                                if (isNaN(value) || value < -180 || value > 180) {
                                    setError(prev => ({
                                        ...prev,
                                        LON: { type: 'error', message: 'Longitude must be between -180 and 180' }
                                    }));
                                } else {
                                    setError(prev => {
                                        const newError = { ...prev };
                                        delete newError.LON;
                                        return newError;
                                    });
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="url"
                        label="Website URL"
                        rules={[{ required: false }]}
                    >
                        <Input
                            placeholder="Website URL"
                            disabled={!editable}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="googleMapUrl"
                        label="Google Map URL"
                        rules={[{ required: false }]}
                    >
                        <Input
                            placeholder="Google Map URL"
                            disabled={!editable}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default LocationStep;
