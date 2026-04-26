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
import { getHsns, createHsn, updateHsn, deleteHsn } from "../../../../api/hsn";

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

    // Access control placeholders
    const createAccess = true;
    const modifyAccess = true;
    const deleteAccess = true;

    useEffect(() => {
        fetchData();
    }, [page, limit, search]);

    const fetchData = async () => {
        setSpinning(true);
        try {
            const res = await getHsns({ page, limit, searchString: search });
            if (res.success) {
                const { hsns, total } = res.data || {};
                setData(hsns || []);
                setCount(total || 0);
            } else {
                message.error(res.message || "Unable to fetch HSN");
            }
        } catch (error) {
            console.error("Error in HSN Code fetch: ", error);
            message.error("Unable to fetch HSN");
        } finally {
            setSpinning(false);
        }
    };

    const handleDelete = async (id) => {
        setSpinning(true);
        try {
            const res = await deleteHsn(id);
            if (res.success) {
                message.success("HSN Code deleted successfully");
                fetchData();
            } else {
                message.error(res.message || "Unable to delete HSN Code");
            }
        } catch (error) {
            console.error("Error on HSN Code delete: ", error);
            message.error("Unable to delete HSN Code");
        } finally {
            setSpinning(false);
        }
    };

    const saveHsn = async (hsn) => {
        setSpinning(true);
        try {
            let response;
            if (hsn.id) {
                response = await updateHsn(hsn.id, hsn);
            } else {
                response = await createHsn(hsn);
            }

            if (response.success) {
                message.success(`HSN Code ${hsn.id ? 'updated' : 'added'} successfully`);
                setAddFlag(false);
                fetchData();
            } else {
                message.error(response.message || "Unable to save HSN Code");
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
                delete={handleDelete}
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
