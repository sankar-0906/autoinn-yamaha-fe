import React, { useState } from "react";
import { Steps, Modal } from "antd";
import _ from "lodash";
import AccountDetails from "./AccountDetails";
import BranchDetails from "./BranchDetails";
import "./index.less";

const { Step } = Steps;

export default function CompanyBranchForm(props) {
  const {
    editable,
    values,
    setValues,
    setVisible,
    setDataSource,
    dataSource,
    setBranch,
    setTableLoading,
    setEditable,
    modifyType,
    view,
    // setDelData,
    // delData,
    // setBankDelData,
    // delbankData
  } = props;
  const [confirmLoading] = useState(false);
  const { current, setCurrent } = props;
  const [toClearFields, setClearFields] = useState(false);

  const [setModifiedData] = useState({});

  const [delData, setDelData] = useState([]);
  const [delbankData, setBankDelData] = useState([]);
  const steps = [
    {
      title: "Location Data",
      content: (
        <BranchDetails
          current={current}
          setCurrent={setCurrent}
          editable={editable}
          toClearFields={toClearFields}
          setClearFields={setClearFields}
          values={values}
          setValues={setValues}
          setModifiedData={setModifiedData}
          view={view}
          setDelData={setDelData}
          delData={delData}
        />
      )
    },
    {
      title: "Bank Data",
      content: (
        <AccountDetails
          current={current}
          setCurrent={setCurrent}
          editable={editable}
          setBranch={setBranch}
          toClearFields={toClearFields}
          setClearFields={setClearFields}
          values={values}
          setValues={setValues}
          setVisible={setVisible}
          setDataSource={setDataSource}
          dataSource={dataSource}
          setTableLoading={setTableLoading}
          setEditable={setEditable}
          modifyType={modifyType}
          setBankDelData={setBankDelData}
          delbankData={delbankData}
          delData={delData}
        />
      )
    }
  ];

  return (
    <div>
      <Modal
        wrapClassName="company-modal"
        title="Company Branch"
        visible={props.visible}
        footer=""
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => {
          props.setVisible(false);
          setClearFields(true);
          props.setValues(null);
          setCurrent(0);
          setBankDelData([]);
          setDelData([]);
        }}
        width="75%"
        confirmLoading={confirmLoading}
      >
        <Steps
          current={current}
          size="small"
          style={{ width: "70%", marginLeft: "15%" }}
        >
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div style={{ margin: "1rem" }}>{steps[current].content}</div>

        <div></div>
      </Modal>
    </div>
  );
}
