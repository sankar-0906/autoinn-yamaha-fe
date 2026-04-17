import React from "react";
import { Table, Divider, Popconfirm, Typography } from "antd";
import dayjs from 'dayjs';

const { Text } = Typography;

const HSNTable = ({
    pagination,
    dataSource,
    openModal,
    spinner,
    delete: deleteData,
    modify,
    deleteAccess,
}) => {

    const column = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text) => <span>{text || "NA"}</span>,
        },
        {
            title: "CGST",
            dataIndex: "cgst",
            key: "cgst",
            render: (text) => <span>{text !== undefined ? `${text}%` : "-"}</span>,
        },
        {
            title: "SGST",
            dataIndex: "sgst",
            key: "sgst",
            render: (text) => <span>{text !== undefined ? `${text}%` : "-"}</span>,
        },
        {
            title: "IGST",
            dataIndex: "igst",
            key: "igst",
            render: (text) => <span>{text !== undefined ? `${text}%` : "-"}</span>,
        },
        {
            title: "Cess",
            dataIndex: "cess",
            key: "cess",
            render: (text) => <span>{text !== undefined ? `${text}%` : "-"}</span>,
        },
        {
            title: "Created On",
            dataIndex: "createdAt",
            key: "createdOn",
            render: (text) => <span>{text ? dayjs(text).format('DD/MM/YYYY') : "-"}</span>,
        },
        {
            title: "Action",
            render: (record) => (
                <div>
                    {modify ? (
                        <span
                            onClick={(event) => {
                                event.stopPropagation();
                                openModal(record.id, true);
                            }}
                            className="linkylink"
                            style={{ color: '#52c41a', cursor: 'pointer' }}
                        >
                            Modify
                        </span>
                    ) : null}
                    {deleteAccess ? (
                        <Popconfirm
                            title="Do you want to delete this HSN Code?"
                            okText="Yes"
                            cancelText="No"
                            onCancel={(event) => {
                                event.stopPropagation();
                            }}
                            onConfirm={(event) => {
                                event.stopPropagation();
                                deleteData(record.id);
                            }}
                        >
                            <span
                                className="linkylink"
                                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <Divider type="vertical" />
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
            rowKey={(record) => record.id}
            pagination={pagination}
            columns={column}
            dataSource={dataSource}
            style={{ cursor: "pointer" }}
            onRow={(record) => ({
                onClick: () => {
                    openModal(record.id, false);
                },
            })}
            loading={spinner}
        />
    );
};

export default HSNTable;
