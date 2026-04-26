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
import { getBranches, createBranch, updateBranch, deleteBranch } from "../../../../api/branch";

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

    const fetchData = async () => {
        setSpinning(true);
        try {
            const res = await getBranches({ page, size: limit, searchString: search });
            if (res.success) {
                const { branch, total } = res.data || {};
                setData(branch || []);
                setCount(total || 0);
            } else {
                message.error(res.message || "Unable to fetch Branches");
            }
        } catch (error) {
            console.error("Error in Branch fetch: ", error);
            message.error("Unable to fetch Branches");
        } finally {
            setSpinning(false);
        }
    };

    const handleDelete = async (id) => {
        setSpinning(true);
        try {
            const res = await deleteBranch(id);
            if (res.success) {
                message.success("Branch deleted successfully");
                fetchData();
            } else {
                message.error(res.message || "Unable to delete Branch");
            }
        } catch (error) {
            console.error("Error on Branch delete: ", error);
            message.error("Unable to delete Branch");
        } finally {
            setSpinning(false);
        }
    };

    const saveBranch = async (branch, branchId) => {
        setSpinning(true);
        try {
            let response;
            if (branchId) {
                response = await updateBranch(branchId, branch);
            } else {
                response = await createBranch(branch);
            }

            if (response.success) {
                message.success(`Branch ${branchId ? 'updated' : 'added'} successfully`);
                fetchData();
                return true;
            } else {
                message.error(response.message || "Unable to save Branch");
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
                deleteBranch={handleDelete}
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
