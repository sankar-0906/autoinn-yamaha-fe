import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import AvatarDropdown from './GlobalHeader/AvatarDropdown';
import logo from '../assets/logo.png';
import styles from './MainLayout.module.css';

const { Header, Sider, Content, Footer } = Layout;

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
            >
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                </div>
                <Navigation />
            </Sider>
            <Layout className={styles.innerLayout}>
                <Header className={styles.layoutHeader}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.trigger}
                    />
                    <AvatarDropdown />
                </Header>
                <Content className={styles.layoutContent}>
                    <Outlet />
                </Content>
                {/* <Footer className={styles.layoutFooter}>
                    Yamaha Depot ©{new Date().getFullYear()}
                </Footer> */}
            </Layout>
        </Layout>
    );
};

export default MainLayout;
