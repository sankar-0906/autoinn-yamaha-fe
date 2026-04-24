import React, { useState } from "react";
import { Modal } from "antd";
import _ from "lodash";
import BranchDetails from "./BranchDetails";
import "./index.less";

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
  } = props;
  const [confirmLoading] = useState(false);
  const { current, setCurrent } = props;
  const [toClearFields, setClearFields] = useState(false);

  const [setModifiedData] = useState({});

  const [delData, setDelData] = useState([]);
  const [delbankData, setBankDelData] = useState([]);

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
        <div style={{ margin: "1rem" }}>
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
            setVisible={setVisible}
            setDataSource={setDataSource}
            setTableLoading={setTableLoading}
            modifyType={modifyType}
            dataSource={dataSource}
            setBankDelData={setBankDelData}
            delbankData={delbankData}
          />
        </div>
      </Modal>
    </div>
  );
}
