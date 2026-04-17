
import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  message,
  Typography,
  Icon,
  Divider,
  Popconfirm,
  Table,
  Empty,
} from "antd";
import FormItem from "antd/lib/form/FormItem";
import { platformApi } from "../../../../../../api";
import { formatValue } from "../../../../../../utils";

const { Text } = Typography;
const { Item } = Form;

function BranchDetails({
  form,
  values,
  current = 0,
  editable = false,
  setValues,
  fromOnBoard = false,
  toClearFields,
  setClearFields,
  setCurrent,
  view,
  delData,
  setDelData,
}) {
  const [error, setError] = useState({});
  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [booleanstate, setbooleanstate] = useState(true);
  const [booleancity, setbooleancity] = useState(true);
  const [manufacturer, setManufacturer] = useState([]);
  const [gstName, setGstName] = useState("");
  const [gstStatus, setGstStatus] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [editPhone, setEditPhone] = useState("");
  const [employee, setEmployee] = useState([]);
  const [senderId, setSenderId] = useState([]);

  const {
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
    validateFields,
    resetFields,
  } = form;

  useEffect(() => {
    platformApi
      .get("/api/location/countries")
      .then((res) => {
        setCountry(res.data.data);
        form.setFieldsValue({ "address.country": res.data?.data[0]?.id });
        selectParams(res.data?.data[0]?.id, "country");
      })
      .catch((err) => {
        message.error("Coudn't fetch Countries");
        console.error("Countries fetch error:", err);
      });
    setFields();
    platformApi.get("/api/user").then((res) => {
      let { data } = res;
      if (data.code === 200) {
        setEmployee(data.data.users);
      }
      // setEmployee(res.data.users)
    });
    platformApi.get("/api/company/senderId").then((res) => {
      let { data } = res;
      if (data.code === 200) {
        let { response } = data;
        if (response.code === 200) {
          const senderIds = JSON.parse(response.data);
          setSenderId(senderIds);
        } else {
          message.error("Couldn't fetch SenderId");
        }
      } else {
        message.error("Couldn't fetch SenderId");
      }
    });
    platformApi
      .post("/api/manufacturer/get", { size: 100, page: 1 })
      .then((res) => {
        let { data } = res;
        if (data.code === 200) {
          let { response } = data;
          if (response.code === 200) {
            setManufacturer(response.data.manufacturer);
          } else {
            message.error("Couldn't fetch manufacturer");
          }
        } else {
          message.error("Couldn't fetch manufacturer");
        }
      });
  }, []);

  const setFields = async () => {
    if (!values) return;

    try {
      // --- Manufacturer & PersonInCharge arrays ---
      let manufacturer = [];
      let personInCharge = [];

      if (values.manufacturer?.[0]?.id) {
        manufacturer = values.manufacturer.map((each) => each.id);
      } else {
        manufacturer = values.manufacturer;
      }

      if (values.personInCharge?.[0]?.id) {
        personInCharge = values.personInCharge.map((each) => each.id);
      } else {
        personInCharge = values.personInCharge;
      }

      setDataSource(values.contacts);

      // STEP 1: set all simple fields immediately
      const formValues = {
        name: values.name,
        gst: values.gst,
        branchType: values.branchType,
        phone: values.phone,
        noOfRamps: values.noOfRamps,
        manufacturer,
        personInCharge,
        senderId: values.senderId || undefined,
        email: values.email,
        url: values.url,
        googleMapUrl: values.googleMapUrl,
      };

      // STEP 2: fetch states & cities if address exists
      if (values.address) {
        // Add address fields to formValues
        formValues.address = {
          state: values.address?.state || null,
          country: values.address?.country || null,
          district: values.address?.district || null,
          locality: values.address?.locality || null,
          pincode: values.address?.pincode || null,
          line1: values.address?.line1 || null,
          line2: values.address?.line2 || null,
          line3: values.address?.line3 || null,
          latitude: values.lat || values.address?.latitude || null,
          longitude: values.lon || values.address?.longitude || null,
        };

        // Fetch states and cities
        const stateRes = await platformApi.post("/api/csc/states", {
          id: values.address.country
        });
        setState(stateRes.data.data);
        setbooleanstate(false);

        if (values.address.state) {
          const citiesRes = await platformApi.post("/api/csc/cities", {
            id: values.address.state
          });
          setCity(citiesRes.data.data);
          setbooleancity(false);
        }
      }

      // Set all form values at once
      setFieldsValue(formValues);

    } catch (err) {
      message.error("Couldn't fetch States or Cities");
      console.error("State/City fetch error :", err);
    }
  };
  useEffect(() => {
    setFields();
  }, [values]);

  const filterMethod = (input, option) =>
    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  useEffect(() => {
    if (toClearFields) {
      setCity([]);
      setState([]);
      setError({});
      setEditPhone("");
      setbooleancity(true);
      setbooleanstate(true);
      resetFields();
      setGstName("");
      setGstStatus("");
      setClearFields(false);
      setDataSource([]);
      // setEmployee([])
    }
  }, [toClearFields]);

  function checkGST(gst) {
    platformApi.post("/api/gstVerify", { gst }).then((res) => {
      let { data } = res;
      if (data.code === 200) {
        let { response } = data;
        if (response.code === 200) {
          if (response.data.data.error) {
            message.error("GST Invalid");
            setGstName("");
            setGstStatus("");
            return false;
          } else {
            message.success("GST Verified");
            delete error.GST;
            setError(error);
            setGstName(response.data.data.taxpayerInfo.tradeNam);
            setGstStatus(response.data.data.taxpayerInfo.sts);
            return true;
          }
        }
      }
    });
    // return true
  }

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
        form.setFieldsValue({ phone: undefined });
        form.setFieldsValue({ category: undefined });
        setEditPhone("");
      } else {
        message.error("Enter Valid Phone Number");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const column = [
    {
      title: <Text strong>Phone Number</Text>,
      dataIndex: "phone",
      key: "phone",
      render: (record) => <span>{record}</span>,
    },
    {
      title: <Text strong>Category</Text>,
      dataIndex: "category",
      key: "category",
      render: (record) => <span>{record}</span>,
    },
    {
      title: <Text strong>Action</Text>,
      render: (Data) => (
        <div>
          {!view && Data.id ? (
            <span>
              <Icon
                onClick={(event) => {
                  event.stopPropagation();
                  setEditPhone(Data.id);
                  form.setFieldsValue({
                    phone: Data.phone,
                    category: Data.category,
                  });
                }}
                type="edit"
              />
              <Divider type="vertical" />
            </span>
          ) : (
            <div />
          )}

          <Popconfirm
            title="Do you want to delete this Mobile Number?"
            okText="Yes"
            cancelText="No"
            onCancel={(event) => {
              event.stopPropagation();
            }}
            onConfirm={(event) => {
              event.stopPropagation();
              deleteData(Data);
            }}
          >
            <Icon type="delete" onClick={(event) => event.stopPropagation()} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const deleteData = (dData) => {
    if (dData.id) {
      let data = dataSource.filter((data) => data.phone !== dData.phone);
      setDataSource(data);
      setDelData([dData]);
      // platformApi
      //   .delete(`/api/branches/contacts/${dData.id}`)
      //   .then((res) => {
      //     if (res.data.response.code === 200) {
      //       setDataSource([]);
      //       let data = dataSource.filter((data) => data.phone !== dData.phone);
      //       setDataSource(data);
      //     } else {
      //       message.error("Phone Not Deleted");
      //     }
      //   });
    } else {
      setDataSource([]);
      const data = dataSource.filter((data) => data.phone !== dData.phone);
      setDataSource(data);
    }
  };
  const handleNext = () => {
    validateFields((validationError) => {
      if (
        validationError === null &&
        !error.EMAIL &&
        !error.URL &&
        !error.PNO &&
        !error.CON &&
        !error.GST &&
        !error.NAME &&
        !error.PIN &&
        !error.locality &&
        !error.address &&
        dataSource.length > 0
      ) {
        setCurrent(1);
        let allDetails = getFieldsValue();
        if (values) {
          let bankDetails = values.bankDetails;
          let id = values.id;
          allDetails.bankDetails = bankDetails;
          allDetails.id = id;
          allDetails.contacts = dataSource;
          // allDetails.personInCharge = personInCharge
        } else {
          allDetails.bankDetails = [{ id: "" }];
          allDetails.contacts = dataSource;
          // allDetails.personInCharge = personInCharge
        }

        setValues(allDetails);
        setGstName("");
      }
      if (dataSource.length === 0) {
        setError({
          ...error,
          CON: {
            type: "error",
            message: "Enter atleast one Contact",
          },
        });
      }
    });
  };

  useEffect(() => {
    if (dataSource.length !== 0) {
      delete error.CON;
      setError({ ...error });
    }
  }, [dataSource]);

  const selectParams = (e, type) => {
    if (type === "country") {
      platformApi
        .post("/api/csc/states", { id: e })
        .then((res) => {
          setState(res.data.data);
          setbooleanstate(false);
          form.setFieldsValue({
            address: {
              state: undefined,
              district: undefined,
            },
          });
        })
        .catch((err) => {
          message.error("Couldn't fetch States");
          console.error("State fetch error :", err);
        });
    }
    if (type === "state") {
      platformApi
        .post("/api/csc/cities", { id: e })
        .then((res) => {
          setCity(res.data.data);
          setbooleancity(false);
          form.setFieldsValue({
            address: {
              district: undefined,
            },
          });
        })
        .catch((err) => {
          message.error("Couldn't fetch Cities");
          console.error("Cities fetch error :", err);
        });
    }
  };

  return (
    <div>
      <Form>
        <Row gutter={16}>
          <Col span={12}>
            <Item
              colon={false}
              label={<Text>Branch Name</Text>}
              validateStatus={error.NAME && error.NAME.type}
              help={error.NAME && error.NAME.message}
            >
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "Enter your Branch Name!",
                  },
                ],
              })(
                <Input
                  placeholder="Branch Name"
                  disabled={editable}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      name: formatValue(e, "allCaps"),
                    })
                  }
                  pattern="^[A-Z][a-zA-Z.\s]*[a-zA-Z.]+$"
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        NAME: {
                          type: "error",
                          message: "Enter Valid Name",
                        },
                      });
                    } else {
                      delete error.NAME;
                      setError(error);
                    }
                  }}
                />
              )}
            </Item>
          </Col>
          <Col span={12}>
            <Item
              label="Address Line 1"
              validateStatus={error.address && error.address.type}
              help={error.address && error.address.message}
            >
              {getFieldDecorator("address.line1", {
                rules: [
                  {
                    required: true,
                  },
                ],
              })(
                <Input
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        address: {
                          type: "error",
                          message: "Enter Valid Address Line1",
                        },
                      });
                    } else {
                      delete error.address;
                      setError(error);
                    }
                  }}
                  maxLength={50}
                  pattern="^([a-zA-Z0-9-/,]+[ -/,])*\w+.?$"
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      "address.line1": formatValue(e, "allCaps"),
                    })
                  }
                  placeholder="Address Line 1"
                  disabled={editable}
                />
              )}
            </Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Item
              label="Address Line 2"
              validateStatus={error.address && error.address.type}
              help={error.address && error.address.message}
            >
              {getFieldDecorator("address.line2", {
                rules: [
                  {
                    required: false,
                  },
                ],
              })(
                <Input
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        address: {
                          type: "error",
                          message: "Enter Valid Address Line2",
                        },
                      });
                    } else {
                      delete error.address;
                      setError(error);
                    }
                  }}
                  maxLength={50}
                  pattern="^([a-zA-Z0-9-/,]+[ -/,])*\w+.?$"
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      "address.line2": formatValue(e, "allCaps"),
                    })
                  }
                  placeholder="Address Line 2"
                  disabled={editable}
                />
              )}
            </Item>
          </Col>
          <Col span={12}>
            <Item
              label="Address Line 3"
              validateStatus={error.address && error.address.type}
              help={error.address && error.address.message}
            >
              {getFieldDecorator("address.line3", {
                rules: [
                  {
                    required: false,
                  },
                ],
              })(
                <Input
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        address: {
                          type: "error",
                          message: "Enter Valid Address",
                        },
                      });
                    } else {
                      delete error.address;
                      setError(error);
                    }
                  }}
                  maxLength={50}
                  pattern="^([a-zA-Z0-9-/,]+[ -/,])*\w+.?$"
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      "address.line3": formatValue(e, "allCaps"),
                    })
                  }
                  placeholder="Address Line 3"
                  disabled={editable}
                />
              )}
            </Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Item
              label="Locality"
              validateStatus={error.locality && error.locality.type}
              help={error.locality && error.locality.message}
            >
              {getFieldDecorator("address.locality", {
                rules: [
                  {
                    required: true,
                    message: "Enter your Locality!",
                  },
                ],
              })(
                <Input
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        locality: {
                          type: "error",
                          message: "Enter Valid Locality",
                        },
                      });
                    } else {
                      delete error.locality;
                      setError(error);
                    }
                  }}
                  placeholder="Locality"
                  pattern="^([a-zA-Z0-9-/,]+[ -/,])*\w+.?$"
                  maxLength={50}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      "address.locality": formatValue(e, "allCaps"),
                    })
                  }
                  disabled={editable}
                />
              )}
            </Item>
          </Col>
          <Col span={12}>
            <FormItem label="Country:">
              {getFieldDecorator("address.country", {
                rules: [{ required: true, message: "Select Country!" }],
              })(
                <Select
                  showAction={["click", "focus"]}
                  placeholder="Select Country"
                  filterOption={filterMethod}
                  onSelect={(e) => selectParams(e, "country")}
                  showSearch={true}
                  style={{ width: "100%" }}
                  disabled={editable}
                >
                  {country.map((d) => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item label="State">
              {getFieldDecorator("address.state", {
                rules: [
                  {
                    required: true,
                    message: "Select State!",
                  },
                ],
              })(
                <Select
                  showAction={["click", "focus"]}
                  placeholder="Select State"
                  disabled={editable || booleanstate}
                  filterOption={filterMethod}
                  onSelect={(e) => selectParams(e, "state")}
                  showSearch={true}
                  style={{ width: "100%" }}
                >
                  {state.map((d) => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Item>
          </Col>
          <Col span={12}>
            <FormItem label="City:">
              {getFieldDecorator("address.district", {
                rules: [{ required: true, message: " Select City!" }],
              })(
                <Select
                  showAction={["click", "focus"]}
                  placeholder="Select City"
                  disabled={editable || booleancity}
                  filterOption={filterMethod}
                  showSearch={true}
                  style={{ width: "100%" }}
                >
                  {city.map((d) => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              validateStatus={error.PIN && error.PIN.type}
              help={error.PIN && error.PIN.message}
              colon={false}
              required={true}
              label={<Text>Pincode</Text>}
            >
              {getFieldDecorator("address.pincode", {
                rules: [{ required: true, message: "Enter Pin code!" }],
              })(
                <Input
                  placeholder="Pincode / Zipcode"
                  maxLength={7}
                  disabled={editable}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      "address.pincode": formatValue(e, "onlyNo"),
                    })
                  }
                  pattern="([0-9]{6}|[0-9]{3}\s[0-9]{3})"
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        PIN: {
                          type: "error",
                          message: "Enter Valid PIN Code",
                        },
                      });
                    } else {
                      delete error.PIN;
                      setError(error);
                    }
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Item label="Branch Type">
              {getFieldDecorator("branchType", {
                rules: [
                  {
                    required: true,
                    message: "Select your Branch Type!",
                  },
                ],
              })(
                <Select
                  placeholder="Branch Type"
                  showAction={["click", "focus"]}
                  disabled={editable}
                >
                  <Select.Option value="Showroom">Showroom</Select.Option>
                  <Select.Option value="Workshop">Workshop</Select.Option>
                  <Select.Option value="Showroom + Workshop">
                    Showroom + Workshop
                  </Select.Option>
                </Select>
              )}
            </Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Item
              label="Latitude"
              validateStatus={error.LAT && error.LAT.type}
              help={error.LAT && error.LAT.message}
            >
              {getFieldDecorator("address.latitude", {
                rules: [
                  {
                    required: true,
                    message: "Enter Latitude",
                  },
                ],
              })(
                <Input
                  placeholder="Enter Latitude"
                  disabled={editable}
                  onInput={(event) => {
                    const value = event.target.value;
                    if (isNaN(value) || value < -90 || value > 90) {
                      setError({
                        ...error,
                        LAT: {
                          type: "error",
                          message: "Latitude must be between -90 and 90",
                        },
                      });
                    } else {
                      delete error.LAT;
                      setError(error);
                    }
                  }}
                />
              )}
            </Item>
          </Col>

          <Col span={12}>
            <Item
              label="Longitude"
              validateStatus={error.LON && error.LON.type}
              help={error.LON && error.LON.message}
            >
              {getFieldDecorator("address.longitude", {
                rules: [
                  {
                    required: true,
                    message: "Enter Longitude",
                  },
                ],
              })(
                <Input
                  placeholder="Enter Longitude"
                  disabled={editable}
                  onInput={(event) => {
                    const value = event.target.value;
                    if (isNaN(value) || value < -180 || value > 180) {
                      setError({
                        ...error,
                        LON: {
                          type: "error",
                          message: "Longitude must be between -180 and 180",
                        },
                      });
                    } else {
                      delete error.LON;
                      setError(error);
                    }
                  }}
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item
              label="GSTIN"
              validateStatus={error.GST && error.GST.type}
              help={error.GST && error.GST.message}
            >
              {getFieldDecorator("gst", {
                rules: [
                  {
                    required: true,
                    message: "Enter GTSIN",
                  },
                ],
              })(
                <Input
                  maxLength={15}
                  placeholder="GSTIN"
                  disabled={editable}
                  onKeyUp={(event) => {
                    setFieldsValue({
                      gst: formatValue(event, "toUpperCase"),
                    });
                  }}
                  onInput={(event) => {
                    if (event.target.value.length === 15) {
                      let flag = checkGST(event.target.value);
                      if (flag) {
                        delete error.GST;
                        setError(error);
                      } else {
                        // message.error('Enter Valid GSTIN')
                        setError({
                          ...error,
                          GST: {
                            type: "error",
                            message: "Enter Valid GSTIN",
                          },
                        });
                      }
                    } else if (gstStatus != "Active") {
                      setGstStatus("");
                      setGstName("");
                      setError({
                        ...error,
                        GST: {
                          type: "error",
                          message: "The GSTIN entered is Inactive",
                        },
                      });
                    } else {
                      setGstName("");
                      setError({
                        ...error,
                        GST: {
                          type: "error",
                          message: "Enter Valid GSTIN",
                        },
                      });
                    }
                  }}
                />
              )}
            </Item>
            {gstName && (
              <Row type="flex" align="middle">
                <Icon
                  style={{ fontSize: 18, marginRight: ".5rem" }}
                  type={"check-circle"}
                  twoToneColor={"#D00"}
                />
                <span style={{ color: "green", fontSize: "12px" }}>
                  {gstName} ({gstStatus})
                </span>
              </Row>
            )}
          </Col>
          <Col
            span={12}
            style={{
              display:
                form.getFieldValue("branchType") === "Workshop" ||
                  form.getFieldValue("branchType") === "Showroom + Workshop"
                  ? "block"
                  : "none",
            }}
          >
            <Item label="Ramp count">
              {getFieldDecorator("noOfRamps", {
                initialValue: values && values.noOfRamps,
                rules: [
                  {
                    required: true,
                    message: "Enter Ramp count",
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  max={9999}
                  style={{ width: "100%" }}
                  disabled={editable}
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item label="Person In Charge">
              {getFieldDecorator("personInCharge", {
                rules: [
                  {
                    required: false,
                    message: "Select Branch Type!",
                  },
                ],
              })(
                <Select
                  placeholder="Person In Charge"
                  disabled={editable || fromOnBoard}
                  showSearch
                  showAction={["click", "focus"]}
                  filterOption={filterMethod}
                  mode="multiple"
                >
                  {employee.map((data) => (
                    <Select.Option key={data.id}>
                      {data && data.profile && data.profile.employeeName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Item>
          </Col>
          <Col span={12}>
            <Item label="Associated Manufacturers">
              {getFieldDecorator("manufacturer", {
                rules: [
                  {
                    required: false,
                    message: "Select  Associated Manufacturers!",
                  },
                ],
              })(
                <Select
                  placeholder="Associated Manufacturer"
                  disabled={editable}
                  showSearch
                  filterOption={filterMethod}
                  mode="multiple"
                  showAction={["click", "focus"]}
                >
                  {manufacturer.map((data) => (
                    <Select.Option key={data.id}>{data.name}</Select.Option>
                  ))}
                </Select>
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item
              colon={false}
              label={<Text>Email</Text>}
              validateStatus={error.EMAIL && error.EMAIL.type}
              help={error.EMAIL && error.EMAIL.message}
              required={false}
            >
              {getFieldDecorator("email", {
                rules: [
                  {
                    required: false,
                    message: "Enter Email!",
                  },
                ],
              })(
                <Input
                  placeholder="Email"
                  disabled={editable}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      email: e.target.value,
                    })
                  }
                  pattern='^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        EMAIL: {
                          type: "error",
                          message: "Enter Valid Email",
                        },
                      });
                    } else {
                      delete error.EMAIL;
                      setError(error);
                    }
                  }}
                />
              )}
            </Item>
            {/* <Item label="Email">              
            <Input
                placeholder="Company Email"
                type="email"
                name="email"    
                autocomplete="off"            
                onChange={(e) => handleChange(e)}
                required
              />              
            </Item> */}
          </Col>
          <Col span={12}>
            <Item
              colon={false}
              label={<Text>Website URL</Text>}
              validateStatus={error.URL && error.URL.type}
              help={error.URL && error.URL.message}
              required={false}
            >
              {getFieldDecorator("url", {
                rules: [
                  {
                    required: false,
                    message: "Enter Website URL!",
                  },
                ],
              })(
                <Input
                  placeholder="URL"
                  disabled={editable}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      url: e.target.value,
                    })
                  }
                  pattern="^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$"
                  onInput={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        URL: {
                          type: "error",
                          message: "Enter Valid Website URL",
                        },
                      });
                    } else {
                      delete error.URL;
                      setError(error);
                    }
                  }}
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Item
              label={
                <Text>
                  <span style={{ color: "red" }}> * </span>Contacts
                </Text>
              }
              validateStatus={error.CON && error.CON.type}
              help={error.CON && error.CON.message}
            >
              <Table
                locale={{
                  emptyText: (
                    <Empty
                      imageStyle={{
                        height: 25,
                        fontSize: 30,
                      }}
                      description={
                        <Text disabled strong>
                          No Contacts
                        </Text>
                      }
                      image={<Icon type="contacts" />}
                    />
                  ),
                }}
                rowKey={(record) => record.id}
                pagination={false}
                size="small"
                columns={column.filter(
                  (columns) =>
                    columns.title.props.children !== "Action" || !view
                )}
                // columns={
                //   column
                //   //   .filter(
                //   //   (columns) =>
                //   //     columns.title.props.children !== "Action" || editable
                //   // )
                // }
                style={{ cursor: "pointer" }}
                dataSource={dataSource}
              />
            </Item>
          </Col>
          <Col span={12}>
            <Item
              colon={false}
              label={<Text>Google Map</Text>}
              required={false}
            >
              {getFieldDecorator("googleMapUrl", {
                rules: [
                  {
                    required: false,
                    message: "Enter Google Map URL!",
                  },
                ],
              })(
                <Input
                  placeholder="Google Map URL"
                  disabled={editable || view}
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      googleMapUrl: e.target.value,
                    })
                  }
                />
              )}
            </Item>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: "10px" }}>
          <Col span={5}>
            <Item
              label="Phone"
              colon={false}
              validateStatus={error.PNO && error.PNO.type}
              help={error.PNO && error.PNO.message}
              required
            >
              {getFieldDecorator("phone", {
                rules: [{ required: false, message: "Enter Phone" }],
              })(
                <Input
                  addonBefore="+91"
                  onWheel={(event) => event.currentTarget.blur()}
                  disabled={editable}
                  placeholder="Phone Number"
                  pattern="^[0-9]{10,11}$"
                  onKeyUp={(e) =>
                    form.setFieldsValue({
                      phone: formatValue(e, "onlyNo"),
                    })
                  }
                  onChange={(event) => {
                    if (!event.target.checkValidity()) {
                      setError({
                        ...error,
                        PNO: {
                          type: "error",
                          message: "Enter Valid Phone Number!",
                        },
                      });
                    } else {
                      delete error.PNO;
                      setError(error);
                    }
                    if (dataSource.length > 0) {
                      if (event.target.checkValidity()) {
                        for (let i = 0; i < dataSource.length; i = i + 1) {
                          if (dataSource[i].phone == event.target.value) {
                            setError({
                              ...error,
                              PNO: {
                                type: "error",
                                message: "Phone Number already exists",
                              },
                            });
                          } else {
                            delete error.PNO;
                            setError(error);
                          }
                        }
                      }
                    }
                  }}
                  // addonBefore="+91"
                  maxLength={11}
                />
              )}
            </Item>
          </Col>
          <Col span={4}>
            <Item label="Category" colon={false} required>
              {getFieldDecorator("category", {
                rules: [{ required: false, message: "Enter Category" }],
              })(
                <Select
                  placeholder="Category"
                  showAction={["click", "focus"]}
                  disabled={editable}
                >
                  <Select.Option key="Sales">Sales</Select.Option>
                  <Select.Option key="Service">Service</Select.Option>
                  <Select.Option key="Spares">Spares</Select.Option>
                </Select>
              )}
            </Item>
          </Col>
          <Col span={3}>
            {!editPhone ? (
              <Button
                style={{ marginTop: "42px" }}
                type="primary"
                disabled={editable}
                onClick={() => {
                  if (
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
                    form.setFieldsValue({
                      phone: undefined,
                      category: undefined,
                    });
                  } else {
                    message.error("Enter valid Phone number or Category");
                  }
                }}
              >
                Add Contact
              </Button>
            ) : (
              <Button
                style={{ marginTop: "42px" }}
                type="primary"
                onClick={() => editingPhone()}
              >
                Save
              </Button>
            )}
          </Col>
        </Row>

        <div style={{ marginTop: "3%" }}>
          <Row>
            <Col span={22}></Col>
            <Col span={2}>
              {current < 1 && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleNext();
                  }}
                >
                  Next
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
}
const WrappedBranchDetail = Form.create({ name: "BranchDetails" })(
  BranchDetails
);
export default WrappedBranchDetail;
