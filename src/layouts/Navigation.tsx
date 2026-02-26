import React from 'react';
import { Menu } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    FileAddOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
    const location = useLocation();

    // const menuItems = [
    //     {
    //         key: 'dashboard',
    //         icon: <DashboardOutlined />,
    //         label: 'Dashboard',
    //         onClick: () => navigate('/dashboard'),
    //     },
    //     {
    //         key: 'company_masters',
    //         icon: <SettingOutlined />,
    //         label: 'Company Settings',
    //         children: [
    //             {
    //                 key: 'company',
    //                 icon: <BankOutlined />,
    //                 label: 'Company',
    //                 onClick: () => navigate('/company'),
    //             },
    //             {
    //                 key: 'branches',
    //                 icon: <CompassOutlined />,
    //                 label: 'Branches',
    //                 onClick: () => navigate('/branches'),
    //             },
    //             {
    //                 key: 'department',
    //                 icon: <DeploymentUnitOutlined />,
    //                 label: 'Departments',
    //                 onClick: () => navigate('/department'),
    //             },
    //             {
    //                 key: 'employee',
    //                 icon: <UserOutlined />,
    //                 label: 'Employees',
    //                 onClick: () => navigate('/employee'),
    //             },
    //         ],
    //     },
    //     {
    //         key: 'inventory_masters',
    //         icon: <ShopOutlined />,
    //         label: 'Inventory Setup',
    //         children: [
    //             {
    //                 key: 'manufacturer',
    //                 icon: <ToolOutlined />,
    //                 label: 'Manufacturers',
    //                 onClick: () => navigate('/manufacturer'),
    //             },
    //             {
    //                 key: 'vehicle-master',
    //                 icon: <ShoppingOutlined />,
    //                 label: 'Vehicle Master',
    //                 onClick: () => navigate('/vehicle-master'),
    //             },
    //             {
    //                 key: 'parts-master',
    //                 icon: <ToolOutlined />,
    //                 label: 'Parts Master',
    //                 onClick: () => navigate('/parts-master'),
    //             },
    //         ],
    //     },
    //     {
    //         key: 'dealer',
    //         icon: <ShopOutlined />,
    //         label: 'Dealers',
    //         onClick: () => navigate('/dealer'),
    //     },
    // ];
    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        // {
        //     key: 'company_masters',
        //     label: 'Company Master',
        //     children: [
        //         { key: '/company', label: <Link to="/company">Company</Link> },
        //         { key: '/company/department', label: <Link to="/company/department">Department</Link> },
        //         { key: '/company/employee', label: <Link to="/company/employee">Employee</Link> },
        //         { key: '/company/manufacturer', label: <Link to="/company/manufacturer">Manufacturer</Link> },
        //         { key: '/company/vehicle_master', label: <Link to="/company/vehicle_master">Vehicle Master</Link> },
        //         { key: '/company/parts_master', label: <Link to="/company/parts_master">Parts Master</Link> },
        //         { key: '/company/dealer_master', label: <Link to="/company/dealer_master">Dealer Master</Link> },
        //         { key: '/company/idgenerator', label: <Link to="/company/idgenerator">ID Generator</Link> },
        //         { key: '/company/frame_number', label: <Link to="/company/frame_number">Frame Number</Link> },
        //     ]
        // },
        {
            key: 'purchase',
            icon: <ShoppingCartOutlined />,
            label: 'Purchase',
            children: [
                {
                    key: '/company/vehicle-stock-inward',
                    icon: <FileAddOutlined />,
                    label: <Link to="/company/vehicle-stock-inward">Vehicle Stock Inward</Link>
                },
            ]
        }
    ];

    return (
        <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className={styles.navMenu}
        />
    );
};

export default Navigation;
