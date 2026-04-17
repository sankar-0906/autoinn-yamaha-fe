// Fixed imports
import React, { useState, useEffect, useContext } from 'react';
import { DownOutlined, LeftOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import {
  Button, Input, Typography, message, Tooltip, Select, Menu, Form
} from 'antd';

import './index.less';
import axiosInstance from "../../../../api/axiosInstance";
import SupplierMasterTable from './SupplierMasterTable';
import SupplierMasterForm from './SupplierMasterForm';
import AdvancedFilters from "./AdvancedFilters";


const { Search } = Input;
const { Title } = Typography;
const { Item } = Menu;

const SupplierMaster = (props) => {
  const [filterForm] = Form.useForm();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [createAccess, setCreateAccess] = useState(true);
  const [modifyAccess, setModifyAccess] = useState(true)
  const [deleteAccess, setDeleteAccess] = useState(true)

  //for filters
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState([]);
  const [filteropen, setFilteropen] = useState(false);
  const [delData, setDelData] = useState([]);
  const [delbankData, setBankDelData] = useState([]);


  useEffect(() => {
    // Access control placeholders
    setCreateAccess(true);
    setModifyAccess(true);
    setDeleteAccess(true);
    setPrimaryData()
  }, []);

  useEffect(() => {
    setPrimaryData(search)
  }, [page, limit, search])

  const setPrimaryData = (search, val) => {
    setTableLoading(true);
    axiosInstance.post('/supplier/get', { page: val ? val : page, size: limit, searchString: search })
      .then((res) => {
        const { data } = res;
        if (data.success) {
          setDataSource(data.data.supplier || []);
          setCount(data.data.count || 0);
        } else {
          message.error('Cannot fetch Supplier Data');
        }

        setTableLoading(false);
      })
      .catch((err) => {
        console.error('Supplier fetch error', err);
        message.error('Cannot fetch Supplier Data');
        setTableLoading(false);
      });
  }




  const deleteSupplier = (id) => {
    let temp = page != 1 && dataSource.length === 1;
    // if (page != 1 && dataSource.length === 1) {
    //   setPage(page - 1)
    // }
    setTableLoading(true);
    axiosInstance.delete(`/supplier/${id}`)
      .then((res) => {
        if (res.data.success) {
          if (temp) {
            setPage(1)
            setPrimaryData(null, 1)
          }
          else {
            setPrimaryData();
          }
          message.success('Supplier Data Deleted');
          setTableLoading(false);
        } else {
          message.error('Supplier Data not Deleted');
          setTableLoading(false);
        }
      })
      .catch((err) => {
        console.error('Supplier Delete Error:', err);
        message.error('Connection Error');
        setTableLoading(false);
      });
  };

  return (
    <div>
      <div className="supplierMaster-top">
        <Title style={{ width: '60%' }} level={4}>
          <Tooltip placement="topLeft" title={"Back to Company Master"}>
            <Button
              style={{ margin: "0 20px" }}
              onClick={() => navigate("/autoadmin/company")}
            >
              <LeftOutlined />
            </Button>
          </Tooltip>
          Supplier Master[{count}]
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
          placeholder="Search Supplier"
          className="searchbar-div-manufacturer"
          style={{ width: '30%' }}
          onSearch={(event) => {
            setPage(1)
            setSearch(event);
          }}
          onChange={(event) => {
            if (event.target.value === "") {
              setSearch(null)
              setPage(1)
            }
          }}
        />
        {/* <div style={{width:"20%",textAlign:"center"}}>
          <Button type="link"onClick={()=>{filteropen?setFilteropen(false):setFilteropen(true)}}>
            { filteropen?"Back":"Advanced  Filters"}
          </Button>
        </div> */}
        <Button
          type="primary"
          className="add-manufacturer-button"
          onClick={() => { setVisible(true); setValues(null); setEditable(false); }}
          style={{ margin: '0 3%', width: '14%' }}
          disabled={!createAccess}
        >
          Add Supplier
        </Button>
      </div>
      <SupplierMasterForm
        open={visible}
        close={() => {
          setVisible(false)
          setDelData([]);
          setBankDelData([]);
        }}
        setDelData={setDelData}
        delData={delData}
        setBankDelData={setBankDelData}
        delbankData={delbankData}
        setDataSource={setDataSource}
        dataSource={dataSource}
        values={values}
        editable={editable}
        setValues={setValues}
        setCount={setCount}
        count={count}
      />
      <div style={{ margin: '.5rem' }} />
      <div style={{ margin: '.5rem' }}>
        <AdvancedFilters
          form={filterForm}
          filteropen={filteropen}
          searchName={search}
          close={setFilteropen}
          id={filter}
          setId={setFilter}
          setData={setDataSource}
          setPrimaryData={setPrimaryData}
        />
        <SupplierMasterTable
          pagination={{
            onChange: (page) => {
              setPage(page);
            },
            pageSize: limit,
            defaultCurrent: 1,
            total: count,
            current: page,
            showQuickJumper: true,
          }}
          dataSource={dataSource}
          deleteSupplier={deleteSupplier}
          tableLoading={tableLoading}
          setVisible={setVisible}
          setValues={setValues}
          setEditable={setEditable}
          modify={modifyAccess}
          deleteAccess={deleteAccess}

        />
      </div>
    </div>
  );
};

export default SupplierMaster;
