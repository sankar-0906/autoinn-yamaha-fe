import React, { useState, useEffect } from "react";
import { Form, Row, Col, Select, Button, Input, message, Slider } from "antd";
import { platformApi } from "../../../../../api";
const { Item } = Form;
const { Option } = Select;
function AdvancedFilters({ form, filteropen, close, searchName, setId, id, setData, setPrimaryData }) {
    const {
        getFieldDecorator,
        setFieldsValue,
        getFieldValue,
        validateFields,
        resetFields,
    } = form;
    const Filters = [
        { id: "1", name: 'Branch Name' },
        { id: "2", name: 'Branch Type' },
    ];
    const type = [
        { key: "showroom", name: "Showroom" },
        { key: "Workshop", name: "Workshop" },
        { key: "Showroom + Workshop", name: "Showroom + Workshop" },
    ]
    const selectFilter = (id) => {
        setId(id);
    }
    const searchValue = () => {
        setId([]);
        resetFields();
        setPrimaryData();
    }
    const filterMethod = (input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    const deleteFilter = (element) => {
        let changedfilter = [];
        id.map((filter) => {
            if (filter !== element) {
                changedfilter.push(filter);
            }
        })
        setId(changedfilter);
        setFieldsValue({ selectfilter: changedfilter, })
    }
    useEffect(() => {
        if (filteropen) {
            setFieldsValue({ selectfilter: id })
        }
    }, [filteropen]);
    useEffect(() => {
        if (id.includes("1")) {
            setFieldsValue({ Name: searchName })
        }
    }, [id, searchName, filteropen]);
    const handleSubmit = () => {
        const data = {
            name: getFieldValue("name"),
            type: getFieldValue("type"),
        }
        platformApi
            .post("api/company/branches/search", data)
            .then((result) => {
                let { data } = result;
                if (data.code === 200) {
                    let { response } = data;
                    if (response.code === 200) {
                        setData(response.data);
                        message.success("Filtered successfully", 2);
                    }
                    else {
                        message.error("Unable to fetch", 2);
                    }
                }
                else {
                    message.error("Unable to fetch", 2);
                }
            })
            .catch((error) => {
                console.error("Error in filtering : ", error);
                message.error("Unable to fetch", 2);
            });
    }
    return (
        <div >
            {filteropen &&
                <div className="AdvancedFilters">
                    <Form >
                        <Row type="flex" justify="space-between">
                            <Col span={14}>
                                <Row type="flex" justify="space-start">
                                    {id.map((element) =>
                                        element === "1" ?
                                            <Col span={8}>
                                                <Item colon={false}>
                                                    <Row type="flex">
                                                        <Col span={20}>
                                                            {getFieldDecorator("name")(
                                                                <Input placeholder="Branch Name" />
                                                            )}
                                                        </Col>
                                                        <Col span={2}>
                                                            <Button type="ghost" shape="circle" size="small" onClick={() => deleteFilter(element)}>&#10005;</Button>
                                                        </Col>
                                                    </Row>
                                                </Item>
                                            </Col>
                                            :
                                            <Col span={8}>
                                                <Item colon={false}>
                                                    <Row type="flex">
                                                        <Col span={20}>
                                                            {getFieldDecorator("type")(
                                                                <Select
                                                                    showAction={["click", "focus"]}
                                                                    placeholder="Branch Type"
                                                                    filterOption={filterMethod}
                                                                    showSearch
                                                                >
                                                                    {type.map((type) => (
                                                                        <Select.Option value={type.key} key={type.key}>
                                                                            {type.name}
                                                                        </Select.Option>
                                                                    ))
                                                                    }
                                                                </Select>
                                                            )}
                                                        </Col>
                                                        <Col span={2}>
                                                            <Button type="ghost" shape="circle" size="small" onClick={() => deleteFilter(element)}>&#10005;</Button>
                                                        </Col>
                                                    </Row>
                                                </Item>
                                            </Col>
                                    )}
                                </Row>
                            </Col>
                            <Col span={10}>
                                <Row type="flex" justify="space-between">
                                    <Col span={19}>
                                        <Item colon={false}>
                                            {getFieldDecorator("selectfilter")(
                                                <Select
                                                    placeholder="Select the Filter"
                                                    onChange={selectFilter}
                                                    mode="multiple"
                                                    showAction={["click", "focus"]}

                                                >
                                                    {Filters.map((type) => (
                                                        <Option key={type.id}>{type.name}</Option>
                                                    ))}
                                                </Select>
                                            )}
                                        </Item>
                                    </Col>
                                    <Col span={5} style={{ marginTop: "0.2rem" }}>
                                        <Button type="primary" onClick={handleSubmit}>
                                            Search
                                        </Button>
                                    </Col>

                                </Row>
                                <Row type="flex" justify="end" style={{ marginRight: "0.79rem" }}>
                                    <Button type="ghost" style={{ width: "4.5rem" }} onClick={searchValue}>
                                        Clear
                                    </Button>
                                </Row>
                            </Col>
                        </Row>

                    </Form>
                </div>
            }
        </div>
    )
}

const WrappedAdvancedFilter = Form.create()(
    AdvancedFilters
);
export default WrappedAdvancedFilter;
