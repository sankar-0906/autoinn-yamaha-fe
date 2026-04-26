import React, { useState, useEffect } from "react";
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
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../api/axiosInstance";

// Components
import BranchTable from "./BranchTable";
import BranchForm from "./BranchForm";

const { Title } = Typography;
const { Search } = Input;

const Branch = ({ isTab = false }) => {
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

    // Access control
    const createAccess = true;
    const modifyAccess = true;
    const deleteAccess = true;

    useEffect(() => {
        fetchData();
    }, [page, limit, search]);

    const fetchData = () => {
        setSpinning(true);
        axiosInstance
            .post("/branches/get", { page, size: limit, searchString: search })
            .then((res) => {
                setSpinning(false);
                const { data } = res;
                if (data.success) {
                    setCount(data.data.count || 0);
                    setData(data.data.branch || []);
                } else {
                    message.error(data.message || "Unable to fetch Branches");
                }
            })
            .catch((error) => {
                setSpinning(false);
                console.error("Error in Branch fetch: ", error);
                message.error("Unable to fetch Branches");
            });
    };

    const deleteData = (id) => {
        setSpinning(true);
        axiosInstance
            .delete(`/branches/${id}`)
            .then((res) => {
                setSpinning(false);
                if (res.data.success) {
                    message.success("Branch deleted successfully");
                    fetchData();
                } else {
                    message.error(res.data.message || "Unable to delete Branch");
                }
            })
            .catch((error) => {
                console.error("Error on Branch delete: ", error);
                setSpinning(false);
                message.error("Unable to delete Branch");
            });
    };

    const saveBranch = async (branch, branchId) => {
        setSpinning(true);
        try {
            let response;
            if (branchId) {
                response = await axiosInstance.put(`/branches/${branchId}`, branch);
            } else {
                response = await axiosInstance.post("/branches", branch);
            }

            if (response.data.success) {
                message.success(`Branch ${branchId ? 'updated' : 'added'} successfully`);
                fetchData();
                return true;
            } else {
                message.error(response.data.message || "Unable to save Branch");
                return false;
            }
        } catch (error) {
            console.error("Error on Branch save: ", error);
            message.error("Unable to save Branch");
            return false;
        } finally {
            setSpinning(false);
        }
    };

    return (
        <div className="branch-master-container" style={{ padding: '20px' }}>
            <div className="accessories-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    {!isTab && (
                        <Tooltip title="Back to Company Master">
                            <Button
                                style={{ marginRight: "20px" }}
                                onClick={() => navigate("/company")}
                                icon={<LeftOutlined />}
                            />
                        </Tooltip>
                    )}
                    Company Branch [{count}]
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
                    placeholder="Search Branch"
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
                    Add Branch
                </Button>
            </div>

            <BranchTable
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
                deleteBranch={deleteData}
                spinner={spinning}
                modify={modifyAccess}
                deleteAccess={deleteAccess}
            />

            {addFlag && (
                <BranchForm
                    data={selectedId ? dataSource.find(item => item.id === selectedId) : null}
                    emitData={saveBranch}
                    open={addFlag}
                    editable={editFlag}
                    close={() => setAddFlag(false)}
                />
            )}
        </div>
    );
}

export default Branch;
