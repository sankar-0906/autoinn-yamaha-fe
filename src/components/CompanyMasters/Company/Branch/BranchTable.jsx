import React from "react";
import { Table, Divider, Popconfirm, Typography, message } from "antd";

const { Text } = Typography;

const BranchTable = (props) => {
    const { pagination, dataSource, modify, deleteAccess, spinner } = props;

    const column = [
        {
            title: "Branch Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <span>{text}</span>,
        },
        {
            title: "No. of Employees",
            dataIndex: "count",
            key: "count",
            render: (text) => <span>{text || 0}</span>,
        },
        {
            title: "Action",
            key: "action",
            render: (data) => (
                <div>
                    {modify ? (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                props.openModal(data.id, true);
                            }}
                            style={{ color: '#1890ff', cursor: 'pointer' }}
                        >
                            Modify
                        </span>
                    ) : null}
                    {modify && deleteAccess ? <Divider type="vertical" /> : null}
                    {deleteAccess ? (
                        <Popconfirm
                            title="Are you sure delete this Branch?"
                            onConfirm={(e) => {
                                e.stopPropagation();
                                if (data.count === 0) {
                                    props.deleteBranch(data.id);
                                } else {
                                    message.error("Employee Associated, You can't Delete this Branch");
                                }
                            }}
                            onCancel={(e) => e.stopPropagation()}
                        >
                            <span
                                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Delete
                            </span>
                        </Popconfirm>
                    ) : null}
                    {!modify && !deleteAccess ? (
                        <Text strong disabled>
                            No Actions Given
                        </Text>
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={column}
            pagination={pagination}
            dataSource={dataSource}
            loading={spinner}
            onRow={(record) => {
                return {
                    onClick: () => {
                        props.openModal(record.id, false);
                    },
                };
            }}
        />
    );
};

export default BranchTable;
