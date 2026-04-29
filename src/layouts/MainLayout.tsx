import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import AvatarDropdown from './GlobalHeader/AvatarDropdown';
import BranchSelector from '../components/BranchSelector/BranchSelector';
import logo from '../assets/logo.png';
import styles from './MainLayout.module.css';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout className={styles.mainLayout}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                theme="light"
                className={styles.sidebar}
                style={{
                    overflowY: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    boxShadow: '2px 0 8px 0 rgba(29, 33, 41, 0.05)'
                }}
            >
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                </div>
                
                {/* Branch Selector below logo - AutoInn style */}
                <div style={{ padding: '0 16px 16px 16px' }}>
                    <BranchSelector collapsed={collapsed} />
                </div>

                <Navigation />
            </Sider>
            <Layout className={styles.innerLayout} style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                <Header className={styles.layoutHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className={styles.trigger}
                        />
                    </div>
                    <AvatarDropdown />
                </Header>
                <Content className={styles.layoutContent}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
