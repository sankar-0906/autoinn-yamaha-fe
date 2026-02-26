import React from 'react';
import { Dropdown, Avatar, Space, type MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AvatarDropdown.module.css';

const AvatarDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') {
            logout();
        } else if (e.key === 'settings') {
            navigate('/company');
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Company Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight">
            <Space className={styles.spaceTrigger}>
                <Avatar size="small" icon={<UserOutlined />} />
                <div className={styles.dropdownContent}>
                    <span className={styles.userName}>{user?.employeeName || 'Admin User'}</span>
                    <span className={styles.userRole}>{user?.role || 'Administrator'}</span>
                </div>
            </Space>
        </Dropdown>
    );
};

export default AvatarDropdown;
