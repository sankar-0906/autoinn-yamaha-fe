import { Card, Typography } from 'antd';

import styles from './ModulePlaceholders.module.css';

const { Title } = Typography;

export const Dashboard = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Dashboard</Title>
        <p className={styles.description}>Welcome to Yamaha Depot Management Dashboard.</p>
    </Card>
);

export const CompanyPage = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Company Settings</Title>
        <p className={styles.description}>Manage your company details here.</p>
    </Card>
);

export const BranchesPage = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Branches</Title>
        <p className={styles.description}>Manage branch locations and details.</p>
    </Card>
);

export const VehicleMasterPage = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Vehicle Master</Title>
        <p className={styles.description}>Setup vehicle types and variants.</p>
    </Card>
);

export const PartsMasterPage = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Parts Master</Title>
        <p className={styles.description}>Manage spare parts inventory setup.</p>
    </Card>
);

export const DealerPage = () => (
    <Card className={styles.placeholderCard} bordered={false}>
        <Title level={2} className={styles.title}>Dealers</Title>
        <p className={styles.description}>Manage external dealers and partners.</p>
    </Card>
);
