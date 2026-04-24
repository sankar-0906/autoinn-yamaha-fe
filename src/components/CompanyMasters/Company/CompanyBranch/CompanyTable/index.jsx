import React, { useState } from "react";
import { Table, Divider, Popconfirm, Typography, Button, message } from "antd";
import { withRouter } from "react-router-dom";
const { Text } = Typography;
const CompanyTable = (props) => {
  const { pagination, dataSource, history, modify, deleteAccess } = props;
  const { goBack } = history;
  const column = [
    // {
    //   render: () => (
    //     <Button
    //       type="ghost"
    //       size="small"
    //       shape="circle"
    //       onClick={(event) => {
    //         event.stopPropagation();
    //         goBack();
    //       }}
    //     >
    //       ...
    //     </Button>
    //   ),
    // },
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "branchName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "No. of Employees",
      dataIndex: "count",
      key: "totalEmployees",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Action",
      render: (data) => (
        <div>
          {modify ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                props.setValues(data);
                props.setVisible(true);
                props.setEditable(false);
                props.setCurrent(0);
                props.setModifyType(true);
                props.setView(false);
              }}
              className="linkylink"
            >
              Modify
            </span>
          ) : (
            <span></span>
          )}
          {deleteAccess ? (
            <Popconfirm
              title="Are you sure delete this Branch?"
              okText="Yes"
              cancelText="No"
              onCancel={(e) => {
                e.stopPropagation();
              }}
              onConfirm={(e) => {
                e.stopPropagation();
                if (data.count === 0) {
                  props.deleteBranch(data.id);
                }
                else {
                  message.error("Employee Associated ,You can't Delete this Branch")
                }
              }}
            >
              <span className="linkylink" onClick={(e) => e.stopPropagation()}>
                <Divider type="vertical" />
                Delete
              </span>
            </Popconfirm>
          ) : (
            <span></span>
          )}
          {!modify && !deleteAccess ? (
            <Text strong disabled>
              No Actions Given
            </Text>
          ) : (
            <span></span>
          )}

          {/* <Divider type="vertical" />
          <Button type="ghost" size="small" shape="circle">
            ...
          </Button> */}
        </div>
      ),
    },
  ];
  return (
    <div>
      <Table
        rowKey={(record) => record.id}
        columns={column}
        pagination={pagination}
        dataSource={dataSource}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              props.setVisible(true);
              props.setValues(record);
              props.setEditable(true);
              props.setModifyType(true);
              props.setView(true)
            },
          };
        }}
      />
    </div>
  );
};

export default withRouter(CompanyTable);
