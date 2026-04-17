import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Input,
  Typography,
  message,
  Statistic,
  Row,
  Col,
  Divider,
} from "antd";
import "./index.less";
import { platformApi } from "../../../../api";
import CompanyTable from "./CompanyTable";
import CompanyBranchForm from "./CompanyBranchForm";
import WrappedAdvancedFilter from "./AdvancedFilters";
import { ContextAPI } from "../../../../ContextAPI";
const { Search } = Input;
const { Title } = Typography;

export default function Company({ fromBranch = false }) {
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editable, setEditable] = useState(true);
  const [current, setCurrent] = useState(0);
  const [modifyType, setModifyType] = useState(false);
  const [createAccess, setCreateAccess] = useState(false);
  const [modifyAccess, setModifyAccess] = useState(false);
  const [deleteAccess, setDeleteAccess] = useState(false);
  const [branch, setBranch] = useState(false);
  const { loginCredintials } = useContext(ContextAPI);
  const [view, setView] = useState();
  const [delData, setDelData] = useState([]);
  const [delbankData, setBankDelData] = useState([]);
  //filters
  const [filter, setFilter] = useState([]);
  const [filteropen, setFilteropen] = useState(false);
  const [search, setSearch] = useState(false);
  useEffect(() => {
    loginCredintials.roleAccess &&
      loginCredintials.roleAccess.map((each) => {
        if (each.subModule === "company") {
          if (each.access.create) {
            setCreateAccess(true);
          }
          if (each.access.update) {
            setModifyAccess(true);
          }
          if (each.access.delete) {
            setDeleteAccess(true);
          }
        }
      });
    setPrimaryData(search);
  }, []);

  const setPrimaryData = (search, val) => {
    setTableLoading(true);
    platformApi
      .post("/api/branches", {
        page: val ? val : page,
        size: 10,
        searchString: search,
      })
      .then((res) => {
        if (res.data.code === 200) {
          let data = res.data.response.data.branch;
          data.map((e, index) => {
            if (e.address) {
              e.address.state = e.address.state.id;
              e.address.country = e.address.country.id;
              e.address.district = e.address.district.id;
            }
          });
          setDataSource(data);
        } else {
          message.error("Branch Fetch Error");
        }

        setTableLoading(false);
      })
      .catch((err) => {
        console.error("Branches fetch error", err);
        message.error("Cannot fetch Branches Data");
        setTableLoading(false);
      });
  };

  useEffect(() => {
    setPrimaryData(search);
  }, [page, search]);

  const deleteBranch = (id) => {
    setTableLoading(true);
    let temp = page != 1 && dataSource.length === 1;
    // if (page != 1 && dataSource.length === 1) {
    //   setPage(1)
    // }
    platformApi
      .delete(`/api/branches/${id}`)
      .then((res) => {
        if (res.data.response.code === 200) {
          setDataSource(dataSource.filter((obj) => id !== obj.id));
          if (temp) {
            setPage(1);
            setPrimaryData(null, 1);
          } else {
            setPrimaryData();
          }
          message.success("Branch Data Deleted");
          setTableLoading(false);
        } else if (res.data.response.code === 300) {
          message.error(res.data.response.message);
          setTableLoading(false);
        } else {
          message.error("Branch Data not Deleted");
          setTableLoading(false);
        }
      })
      .catch((err) => {
        console.error("Branch Delete Error:", err);
        message.error("Connection Error");
        setTableLoading(false);
      });
  };

  return (
    <div>
      <div className="companyMaster-top">
        <Title style={{ width: "60%" }} level={4}>
          Company Dashboard
        </Title>
        <Search
          placeholder="Search Branch"
          className="searchbar-div-manufacturer"
          style={{ width: "30%" }}
          onSearch={(event) => {
            setPage(1);
            setSearch(event);
          }}
          onChange={(event) => {
            if (event.target.value === "") {
              setSearch(null);
              setPage(1);
            }
          }}
        />
        <Button
          type="primary"
          className="add-manufacturer-button"
          onClick={() => {
            setVisible(true);
            setValues(null);
            setEditable(false);
            setCurrent(0);
            setModifyType(false);
            setView(false);
          }}
          style={{ margin: "0 3%", width: "14%" }}
          disabled={!createAccess}
        >
          Add Branch
        </Button>
      </div>
      <WrappedAdvancedFilter
        filteropen={filteropen}
        searchName={search}
        close={setFilteropen}
        id={filter}
        setId={setFilter}
        setData={setDataSource}
        setPrimaryData={setPrimaryData}
      />
      <CompanyBranchForm
        visible={visible}
        fromBranch={fromBranch}
        setVisible={setVisible}
        setDataSource={setDataSource}
        dataSource={dataSource}
        values={values}
        editable={editable}
        setEditable={setEditable}
        setValues={setValues}
        current={current}
        setCurrent={setCurrent}
        setTableLoading={setTableLoading}
        modifyType={modifyType}
        setBranch={setBranch}
        view={view}
        setBankDelData={setBankDelData}
        delbankData={delbankData}
      />

      <div style={{ margin: "4rem 0 0 0" }}>
        <CompanyTable
          pagination={{
            pageSize: 10,
            defaultCurrent: 1,
            current: page,
            total: dataSource.length,
            showQuickJumper: true,
            onChange: (page) => {
              setPage(page);
            },
          }}
          dataSource={dataSource}
          deleteBranch={deleteBranch}
          tableLoading={tableLoading}
          setVisible={setVisible}
          setValues={setValues}
          setEditable={setEditable}
          setCurrent={setCurrent}
          setModifyType={setModifyType}
          modify={modifyAccess}
          setView={setView}
          deleteAccess={deleteAccess}
        />
      </div>
      <div></div>
    </div>
  );
}
