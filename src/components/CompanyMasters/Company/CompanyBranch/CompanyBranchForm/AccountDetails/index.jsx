import React, { useState, useEffect } from "react";
import {
  Button,
  Tabs,
  Form,
  Row,
  Col,
  Input,
  Layout,
  message,
  Popconfirm,
  Select,
} from "antd";
import { platformApi } from "../../../../../../api";
import { formatValue } from "../../../../../../utils";

const { TabPane } = Tabs;
const { Footer } = Layout;

function AccountDetails(props) {
  const { getFieldDecorator } = props.form;
  const {
    form,
    setValues,
    values,
    editable,
    setBranch,
    setVisible,
    dataSource,
    setDataSource,
    setTableLoading,
    modifyType,
    setBankDelData,
    delbankData,
    delData,
  } = props;

  const [error, setError] = useState({});
  const [bankname, setBankName] = useState();
  const [bankdetails, setbankdetails] = useState([]);
  useEffect(() => {
    if (props.toClearFields) {
      form.resetFields();
      props.setClearFields(false);
    }
  }, [props.toClearFields]);

  useEffect(() => {
    if (values) {
      // form.setFieldsValue({
      //   bankDetails: values.bankDetails
      // });
      // setbankdetails(values.bankDetails)
    }
  }, [values]);

  useEffect(() => {
    if (values.bankDetails === null) {
      let data = values;
      data.bankDetails = [];
      setValues(data);
    }
  }, []);

  const previousPage = () => {
    // let { bankDetails } = form.getFieldsValue();
    const keys = ["name", "accountName", "ifsc", "accountNumber"];
    if (values) {
      const newData = values.bankDetails.map((item, index) => {
        keys.map((key) => {
          item[key] = bankDetails[index][key];
        });
        return item;
      });
      values.bankDetails = newData;
    }
  };

  const deleteAccount = (id) => {
    let thisData = values;
    thisData.bankDetails = thisData.bankDetails.filter((obj) => id !== obj.id);
    setBankDelData([id]);
    // platformApi.delete(`/api/branches/banks/${id}`)
    //   .then(res => {
    //     let { data } = res;
    //     if (data.code === 200) {
    //       let { response } = data;
    //       if (response.code === 200) {
    //         let thisData = values;
    //         thisData.bankDetails = thisData.bankDetails.filter(obj => id !== obj.id);
    //         setValues({ ...values, bankDetails: [] })
    //         setValues(thisData);
    //         setDataSource([]);
    //         let allData = dataSource
    //         allData.map((eachBranch, index) => {
    //           if (eachBranch.id === thisData.id) {
    //             allData[index] = thisData;
    //           }
    //         })
    //         setDataSource(allData)
    //       }
    //     }
    //     else {
    //       message.error('Coudn\'t delete this bank');
    //     }
    //   })
    //   .catch(err => {
    //     message.error('Connection Error');
    //   })
  };

  const handleSubmit = () => {
    let arr = {};
    let temp = false;
    if (values.bankDetails.length > 0) {
      temp = values.bankDetails.some((item) => {
        return !(
          item.name &&
          item.accountName &&
          item.accountNumber &&
          item.ifsc
        );
      });
    } else {
      temp = false;
    }
    if (values.bankDetails.length > 0) {
      values.bankDetails.map((item, index) => {
        if (!(item.name && /^[a-zA-Z.\s]*[a-zA-Z.]+$/.test(item.name))) {
          arr = {
            ...arr,
            BANK: {
              type: "error",
              message: "Enter a Valid Bank Name",
            },
          };
        }
        if (
          !(
            item.accountName &&
            /^[a-zA-Z.\s]*[a-zA-Z.]+$/.test(item.accountName)
          )
        ) {
          arr = {
            ...arr,
            HOLDER: {
              type: "error",
              message: "Enter a Valid Account Name",
            },
          };
        }
        if (!(item.accountNumber && /^[0-9]{9,18}$/.test(item.accountNumber))) {
          arr = {
            ...arr,
            AN: {
              type: "error",
              message: "Enter a Valid Account Number",
            },
          };
        }
        if (!(item.ifsc && /^[A-Z|a-z|0-9]{11}$/.test(item.ifsc))) {
          arr = {
            ...arr,
            IFSC: {
              type: "error",
              message: "Enter a Valid IFSC Code",
            },
          };
        }
        setError({
          ...error,
          [`Account No-${index}`]: arr,
        });
      });
    }

    if (!temp) {
      const keys = ["name", "accountName", "ifsc", "accountNumber"];
      const newData = values.bankDetails.map((item, index) => {
        keys.map((key) => {
          item[key] = values.bankDetails[index][key];
        });
        return item;
      });

      let flag = false;
      if (newData.length > 0) {
        newData.map((each) => {
          if (each.name && each.accountName && each.ifsc && each.accountNumber)
            flag = true;
          else flag = false;
        });
      } else {
        flag = true;
      }
      if (flag) {
        props.setCurrent(0);
        setVisible(false);
        values.bankDetails = newData;
        setTableLoading(true);
        if (!modifyType) {
          platformApi
            .post("/api/branches", values)
            .then((res) => {
              if (res.data.code === 200) {
                let data = dataSource;
                setDataSource([]);
                let responseData = res.data.response.data;
                responseData.count = 0;
                // responseData.address.line1 = responseData.address.line1;
                // responseData.address.line2 = responseData.address.line2;
                // responseData.address.line3 = responseData.address.line3;
                responseData.address.state = responseData.address.state.id;
                responseData.address.country = responseData.address.country.id;
                responseData.address.district =
                  responseData.address.district.id;
                data.push(responseData);
                setDataSource(data);
                message.success("Branch added Successfully");
                setBranch(true);
                setVisible(false);
                setTableLoading(false);
              } else {
                message.error("Error Adding Branch");
              }
            })
            .catch((err) => {
              message.error("Connection Error");
            });
        } else {
          if (delData && delData.length > 0) {
            for (let i = 0; i < delData.length; i++) {
              const ele = delData[i];
              platformApi
                .delete(`/api/branches/contacts/${ele.id}`)
                .then((res) => {
                  if (res.data.response.code === 200) {
                    message.success("Mobile number deleted successfully!");
                  } else {
                    message.error("Phone Not Deleted");
                  }
                });
            }
          }
          if (delbankData && delbankData.length > 0) {
            for (let i = 0; i < delbankData.length; i++) {
              const ele = delbankData[i];
              platformApi
                .delete(`/api/branches/banks/${ele}`)
                .then((res) => {
                  let { data } = res;
                  if (data.code === 200) {
                    let { response } = data;
                    if (response.code === 200) {
                      message.success("Bank data deleted successfully!");
                      // let thisData = values;
                      // thisData.bankDetails = thisData.bankDetails.filter(obj => id !== obj.id);
                      // setValues({ ...values, bankDetails: [] })
                      // setValues(thisData);
                      // setDataSource([]);
                      // let allData = dataSource
                      // allData.map((eachBranch, index) => {
                      //   if (eachBranch.id === thisData.id) {
                      //     allData[index] = thisData;
                      //   }
                      // })
                      // setDataSource(allData)
                    }
                  } else {
                    message.error("Coudn't delete this bank");
                  }
                })
                .catch((err) => {
                  message.error("Connection Error");
                });
            }
          }
          platformApi
            .put(`/api/branches/${values.id}`, values)
            .then((res) => {
              if (res.data.code === 200) {
                let data = dataSource;
                setDataSource([]);
                let responseData = res.data.response.data;
                // responseData.address.line1 = responseData.address.line1;
                // responseData.address.line2 = responseData.address.line2;
                // responseData.address.line3 = responseData.address.line3;
                responseData.address.state = responseData.address.state.id;
                responseData.address.country = responseData.address.country.id;
                responseData.address.district =
                  responseData.address.district.id;
                data.some((obj, index) => {
                  if (obj.id === responseData.id) data[index] = responseData;
                });
                setDataSource(data);
                message.success("Branch Saved Successfully");
                setVisible(false);
                setTableLoading(false);
              } else {
                message.error("Error Saving Branch");
              }
            })
            .catch((err) => {
              message.error("Connection Error");
            });
        }
        props.setValues(null);
      }
      // form.validateFields((validationError) => {
      //   if (validationError === null && !error.BANK && !error.HOLDER && !error.AN && !error.IFSC) {
      //     const keys = ["name", "accountName", "ifsc", "accountNumber"]
      //     const newData = values.bankDetails.map((item, index) => {
      //       keys.map((key) => {
      //         item[key] = values.bankDetails[index][key]
      //       })
      //       return item;
      //     })

      //     let flag = false
      //     newData.map(each => {
      //       if (each.name && each.accountName && each.ifsc && each.accountNumber)
      //         flag = true
      //       else
      //         flag = false
      //     })
      //     if (flag) {
      //       props.setCurrent(0);
      //       setVisible(false);
      //       values.bankDetails = newData;
      //       setTableLoading(true);
      //       if (!modifyType) {
      //         platformApi.post('/api/branches', values)
      //           .then(res => {
      //             if (res.data.code === 200) {
      //               let data = dataSource;
      //               setDataSource([]);
      //               let responseData = res.data.response.data;
      //               responseData.count = 0;
      //               responseData.address.state = responseData.address.state.id;
      //               responseData.address.country = responseData.address.country.id;
      //               responseData.address.district = responseData.address.district.id;
      //               data.push(responseData);
      //               setDataSource(data);
      //               message.success('Branch added Successfully');
      //               setBranch(true)
      //               setVisible(false);
      //               setTableLoading(false)
      //             }
      //             else {
      //               message.error('Error Adding Branch');
      //             }
      //           })
      //           .catch((err) => {
      //             message.error('Connection Error');
      //           })
      //       }
      //       else {
      //         if (delbankData && delbankData.length > 0) {
      //           for (let i = 0; i < delbankData.length; i++) {
      //             const ele = delbankData[i];
      //             platformApi.delete(`/api/branches/banks/${ele}`)
      //               .then(res => {
      //                 let { data } = res;
      //                 if (data.code === 200) {
      //                   let { response } = data;
      //                   if (response.code === 200) {
      //                     message.success("Bank data deleted successfully!")
      //                     // let thisData = values;
      //                     // thisData.bankDetails = thisData.bankDetails.filter(obj => id !== obj.id);
      //                     // setValues({ ...values, bankDetails: [] })
      //                     // setValues(thisData);
      //                     // setDataSource([]);
      //                     // let allData = dataSource
      //                     // allData.map((eachBranch, index) => {
      //                     //   if (eachBranch.id === thisData.id) {
      //                     //     allData[index] = thisData;
      //                     //   }
      //                     // })
      //                     // setDataSource(allData)
      //                   }
      //                 }
      //                 else {
      //                   message.error('Coudn\'t delete this bank');
      //                 }
      //               })
      //               .catch(err => {
      //                 message.error('Connection Error');
      //               })
      //           }
      //         }
      //         platformApi.put(`/api/branches/${values.id}`, values)
      //           .then(res => {
      //             if (res.data.code === 200) {
      //               let data = dataSource;
      //               setDataSource([])
      //               let responseData = res.data.response.data;
      //               responseData.address.state = responseData.address.state.id;
      //               responseData.address.country = responseData.address.country.id;
      //               responseData.address.district = responseData.address.district.id;
      //               data.some((obj, index) => {
      //                 if (obj.id === responseData.id) data[index] = responseData;
      //               });
      //               setDataSource(data);
      //               message.success('Branch Saved Successfully');
      //               setVisible(false);
      //               setTableLoading(false)
      //             }
      //             else {
      //               message.error('Error Saving Branch');
      //             }
      //           })
      //           .catch((err) => {
      //             message.error('Connection Error');
      //           })
      //       }
      //       props.setValues(null)
      //     }
      //   }
      //   else {
      //     message.error('Enter all fields')
      //   }
      // })
    }
  };

  const addBank = () => {
    if (values) {
      let newData = { ...values };
      setValues({ ...values, bankDetails: [] });
      newData.bankDetails.push({ id: "" });
      setValues(newData);
    }
  };

  const removeBank = (index) => {
    let tmpData = { ...values };
    tmpData.bankDetails.splice(index, 1);
    setValues(tmpData);
  };

  return (
    <div>
      <div>
        <Tabs
          defaultActiveKey="1"
          onChange={() => { }}
          tabPosition="left"
          style={{ height: 420 }}
        >
          {values &&
            values.bankDetails.map((key, index) => (
              <TabPane tab={`Account No-${index + 1}`} key={index}>
                <div
                  style={{
                    maxHeight: 350,
                    overflowY: "auto",
                    paddingRight: 16,
                  }}
                >
                  <Form>
                    <Row>
                      <Col span={12}>
                        <Form.Item
                          validateStatus={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].IFSC &&
                            error[`Account No-${index}`].IFSC.type
                          }
                          help={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].IFSC &&
                            error[`Account No-${index}`].IFSC.message
                          }
                          label="IFSC"
                          required
                        >
                          {/* {getFieldDecorator(`bankDetails[${index}].ifsc`, {
                          rules: [
                            {
                              required: true,
                              message: "Enter a Valid IFSC Code"
                            }
                          ]
                        })( */}
                          <Input
                            style={{ textTransform: "uppercase" }}
                            disabled={editable}
                            maxLength={11}
                            pattern="^[A-Z|a-z|0-9]{11}$"
                            placeholder="IFSC Code"
                            value={
                              values.bankDetails[index] &&
                              values.bankDetails[index].ifsc
                            }
                            onChange={(event) => {
                              if (event.target.value.length > 0) {
                                values.bankDetails[index].ifsc =
                                  event.target.value;
                                setValues({ ...values });
                              } else {
                                values.bankDetails[index].ifsc = null;
                                setValues({ ...values });
                              }
                            }}
                            // onInput={(event) => {
                            //   if (!event.target.checkValidity()) {
                            //     setError({
                            //       ...error,
                            //       IFSC: {
                            //         type: "error",
                            //         message: "Enter a Valid IFSC Code",
                            //       },
                            //     });
                            //   } else {
                            //     delete error.IFSC;
                            //     setError(error);
                            //   }
                            // }}
                            onInput={(event) => {
                              if (!event.target.checkValidity()) {
                                setError({
                                  ...error,
                                  [`Account No-${index}`]: {
                                    ...error[`Account No-${index}`],
                                    IFSC: {
                                      type: "error",
                                      message: "Enter a Valid IFSC Code",
                                    },
                                  },
                                });
                              } else {
                                delete error[`Account No-${index}`].IFSC;
                                setError(error);
                              }
                            }}
                          />
                          {/* )} */}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12}>
                        <Form.Item
                          validateStatus={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].HOLDER &&
                            error[`Account No-${index}`].HOLDER.type
                          }
                          help={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].HOLDER &&
                            error[`Account No-${index}`].HOLDER.message
                          }
                          label="Account Name"
                          required
                        >
                          <Input
                            pattern="^[a-zA-Z.\s]*[a-zA-Z.]+$"
                            // pattern="^[a-zA-Z]+(([a-zA-Z ])?[a-zA-Z]*)*$"
                            value={
                              values.bankDetails[index] &&
                              values.bankDetails[index].accountName
                            }
                            onChange={(event) => {
                              if (event.target.value.length > 0) {
                                values.bankDetails[
                                  index
                                ].accountName = formatValue(event, "firstCaps");
                                setValues({ ...values });
                              } else {
                                values.bankDetails[index].accountName = null;
                                setValues({ ...values });
                              }
                            }}
                            // onInput={(event) => {
                            //   if (!event.target.checkValidity()) {
                            //     setError({
                            //       ...error,
                            //       HOLDER: {
                            //         type: "error",
                            //         message: "Enter a Valid Account Name"
                            //       }
                            //     })
                            //   }
                            //   else {
                            //     delete error.HOLDER
                            //     setError(error)
                            //   }
                            // }}
                            onInput={(event) => {
                              if (!event.target.checkValidity()) {
                                setError({
                                  ...error,
                                  [`Account No-${index}`]: {
                                    ...error[`Account No-${index}`],
                                    HOLDER: {
                                      type: "error",
                                      message: "Enter a Valid Account Name",
                                    },
                                  },
                                });
                              } else {
                                delete error[`Account No-${index}`].HOLDER;
                                setError(error);
                              }
                            }}
                            placeholder="Account Name"
                            disabled={editable}
                          />
                          {/* )} */}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12}>
                        <Form.Item
                          validateStatus={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].AN &&
                            error[`Account No-${index}`].AN.type
                          }
                          help={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].AN &&
                            error[`Account No-${index}`].AN.message
                          }
                          // validateStatus={error.AN && error.AN.type}
                          // help={error.AN && error.AN.message}
                          label="Account Number"
                          required
                        >
                          {/* {getFieldDecorator(
                          `bankDetails[${index}].accountNumber`,
                          {
                            rules: [
                              {
                                required: true,
                                message: "Enter a Valid Account Number!"
                              }
                            ]
                          }
                        )( */}
                          <Input
                            onWheel={(event) => event.currentTarget.blur()}
                            placeholder="Account Number"
                            pattern="^[0-9]{9,18}$"
                            value={
                              values.bankDetails[index] &&
                              values.bankDetails[index].accountNumber
                            }
                            onChange={(event) => {
                              if (event.target.value.length > 0) {
                                values.bankDetails[index].accountNumber =
                                  event.target.value;
                                setValues({ ...values });
                              } else {
                                values.bankDetails[index].accountNumber = null;
                                setValues({ ...values });
                              }
                            }}
                            onInput={(event) => {
                              if (!event.target.checkValidity()) {
                                setError({
                                  ...error,
                                  [`Account No-${index}`]: {
                                    ...error[`Account No-${index}`],
                                    AN: {
                                      type: "error",
                                      message: "Enter a Valid Account Number",
                                    },
                                  },
                                });
                              } else {
                                delete error[`Account No-${index}`].AN;
                                setError(error);
                              }
                            }}
                            // onInput={(event) => {
                            //   if (!event.target.checkValidity()) {
                            //     setError({
                            //       ...error,
                            //       AN: {
                            //         type: "error",
                            //         message: "Enter a Valid Account Number",
                            //       },
                            //     });
                            //   } else {
                            //     delete error.AN;
                            //     setError(error);
                            //   }
                            // }}
                            disabled={editable}
                          />
                          {/* )} */}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12} key={index}>
                        <Form.Item
                          validateStatus={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].BANK &&
                            error[`Account No-${index}`].BANK.type
                          }
                          help={
                            error[`Account No-${index}`] &&
                            error[`Account No-${index}`].BANK &&
                            error[`Account No-${index}`].BANK.message
                          }
                          label="Bank Name"
                          required
                        >
                          <Input
                            key={index}
                            value={
                              values.bankDetails[index] &&
                              values.bankDetails[index].name
                            }
                            pattern="^[a-zA-Z.\s]*[a-zA-Z.]+$"
                            onChange={(e) => {
                              if (e.target.value.length > 0) {
                                values.bankDetails[index].name = formatValue(
                                  e,
                                  "toLowerCase"
                                );
                                setValues({ ...values });
                              } else {
                                values.bankDetails[index].name = null;
                                setValues({ ...values });
                              }
                            }}
                            onInput={(event) => {
                              if (!event.target.checkValidity()) {
                                setError({
                                  ...error,
                                  [`Account No-${index}`]: {
                                    ...error[`Account No-${index}`],
                                    BANK: {
                                      type: "error",
                                      message: "Enter a Valid Bank Name",
                                    },
                                  },
                                });
                              } else {
                                delete error[`Account No-${index}`].BANK;
                                setError(error);
                              }
                            }}
                            placeholder="Bank Name"
                            disabled={editable}
                          />
                          {/* )} */}
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12} key={index}>
                        <Form.Item label="Account Type" required>
                          <Select
                            value={
                              values.bankDetails[index] &&
                              values.bankDetails[index].accountType
                            }
                            onChange={(val) => {
                              values.bankDetails[index].accountType = val;
                              setValues({ ...values });
                            }}
                            disabled={editable}
                            placeholder="Select Account Type"
                          >
                            <Select.Option value="SAVINGS">
                              Savings
                            </Select.Option>
                            <Select.Option value="CURRENT">
                              Current
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12} key={index}></Col>
                    </Row>
                    {key.id !== "" ? (
                      <Popconfirm
                        title="Are you sure you want to delete this Account?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={(e) => {
                          deleteAccount(key.id);
                        }}
                      >
                        <Row style={{}}>
                          <span
                            style={{ display: editable ? "none" : "block" }}
                            className="linkylink"
                          >
                            Delete this Account
                          </span>
                        </Row>
                      </Popconfirm>
                    ) : (
                      <div>
                        <Row style={{}}>
                          <span
                            style={{ display: editable ? "none" : "block" }}
                            className="linkylink"
                            onClick={() => removeBank(index)}
                          >
                            Delete this Account
                          </span>
                        </Row>
                      </div>
                    )}
                  </Form>
                </div>
              </TabPane>
            ))}
        </Tabs>
      </div>
      <div style={{ marginTop: "2%" }}>
        {!editable ? (
          <div>
            {props.current > 0 && (
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  props.setCurrent(0);
                  previousPage();
                }}
              >
                Previous
              </Button>
            )}

            <span
              style={{ marginLeft: "30%" }}
              className="linkylink"
              onClick={() => addBank()}
            >
              Add a New Bank Account
            </span>
            <Button
              type="primary"
              style={{ marginLeft: "30%" }}
              onClick={() => handleSubmit()}
            >
              Submit
            </Button>
          </div>
        ) : (
          <div>
            {props.current > 0 && (
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  props.setCurrent(0);
                  previousPage();
                }}
              >
                Previous
              </Button>
            )}
            <Button
              onClick={() => {
                props.setVisible(false), props.setCurrent(0);
              }}
              style={{ marginLeft: "73%" }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const WrappedAccountDetails = Form.create({ name: "AccountDetails" })(
  AccountDetails
);
export default WrappedAccountDetails;
