import React, { useState, useEffect, useContext } from "react";
import {
    Typography,
    Input,
    Button,
    Select,
    message,
    Tooltip
} from "antd";
import {
    LeftOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../api/axiosInstance";

// Components
import HSNTable from "./HSNTable";
import HSNForm from "./HSNForm";

const { Title } = Typography;
const { Search } = Input;

const HSNCode = () => {
    const navigate = useNavigate();
    const [limit, setLimit] = useState(10);
    const [addFlag, setAddFlag] = useState(false);
    const [editFlag, setEditFlag] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [dataSource, setData] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('')

    // Access control placeholders (can be linked to global state later)
    const createAccess = true;
    const modifyAccess = true;
    const deleteAccess = true;


    useEffect(() => {
        fetchData();
    }, [page, limit, search]);

    const fetchData = () => {
        setSpinning(true);
        axiosInstance
            .post("/hsn/get", { page, limit, searchString: search })
            .then((res) => {
                setSpinning(false);
                const { data } = res;
                if (data.success) {
                    setCount(data.data.count || 0);
                    setData(data.data.hsn || []);
                } else {
                    message.error(data.message || "Unable to fetch HSN");
                }
            })
            .catch((error) => {
                setSpinning(false);
                console.error("Error in HSN Code fetch: ", error);
                message.error("Unable to fetch HSN");
            });
    };

    const deleteData = (id) => {
        setSpinning(true);
        axiosInstance
            .delete(`/hsn/${id}`)
            .then((res) => {
                setSpinning(false);
                if (res.data.success) {
                    message.success("HSN Code deleted successfully");
                    fetchData();
                } else {
                    message.error(res.data.message || "Unable to delete HSN Code");
                }
            })
            .catch((error) => {
                console.error("Error on HSN Code delete: ", error);
                setSpinning(false);
                message.error("Unable to delete HSN Code");
            });
    };

    const saveHsn = async (hsn) => {
        setSpinning(true);
        try {
            let response;
            if (hsn.id) {
                response = await axiosInstance.put(`/hsn/${hsn.id}`, hsn);
            } else {
                response = await axiosInstance.post("/hsn", hsn);
            }

            if (response.data.success) {
                message.success(`HSN Code ${hsn.id ? 'updated' : 'added'} successfully`);
                fetchData();
            } else {
                message.error(response.data.message || "Unable to save HSN Code");
            }
        } catch (error) {
            console.error("Error on HSN Code save: ", error);
            message.error("Unable to save HSN Code");
        } finally {
            setSpinning(false);
        }
    };

    return (
        <div className="hsn-master-container" style={{ padding: '20px' }}>
            <div className="accessories-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Back to Company Master">
                        <Button
                            style={{ marginRight: "20px" }}
                            onClick={() => navigate("/company")}
                            icon={<LeftOutlined />}
                        />
                    </Tooltip>
                    HSN Code [{count}]
                    <Select
                        value={limit}
                        onChange={(val) => {
                            setLimit(val);
                            setPage(1);
                        }}
                        style={{ marginLeft: "1rem", width: 80 }}
                        options={[
                            { value: 10, label: "10" },
                            { value: 20, label: "20" },
                            { value: 50, label: "50" },
                            { value: 100, label: "100" },
                        ]}
                    />
                </Title>

                <Search
                    style={{ width: "30%" }}
                    placeholder="Search by Code or Description"
                    onSearch={(val) => {
                        setPage(1);
                        setSearch(val);
                    }}
                    onChange={(e) => {
                        if (e.target.value === "") {
                            setSearch("");
                            setPage(1);
                        }
                    }}
                    allowClear
                />

                <Button
                    type="primary"
                    onClick={() => {
                        setSelectedId(null);
                        setEditFlag(true);
                        setAddFlag(true);
                    }}
                    disabled={!createAccess}
                    style={{ width: "150px" }}
                >
                    Add HSN Code
                </Button>
            </div>

            <HSNTable
                pagination={{
                    onChange: (p) => setPage(p),
                    pageSize: limit,
                    total: count,
                    current: page,
                    showSizeChanger: false,
                }}
                openModal={(id, editable) => {
                    setSelectedId(id);
                    setEditFlag(editable);
                    setAddFlag(true);
                }}
                dataSource={dataSource}
                delete={deleteData}
                spinner={spinning}
                modify={modifyAccess}
                deleteAccess={deleteAccess}
            />

            <HSNForm
                data={dataSource.find(item => item.id === selectedId)}
                emitData={saveHsn}
                open={addFlag}
                editable={editFlag}
                close={() => setAddFlag(false)}
                modify={modifyAccess}
            />
        </div>
    );
}

export default HSNCode;
