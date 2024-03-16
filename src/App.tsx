import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Breadcrumb, Card, Descriptions, Flex, Layout, Menu, Space, Table, theme, Typography} from 'antd';
import {useGetChatStatsQuery} from "./services/strategies";
import {useSearchParams} from "react-router-dom";
import {createChart} from "lightweight-charts";
import Chart from "./Chart";

const {Header, Content, Footer, Sider} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Option 1', '1', <PieChartOutlined/>),
    getItem('Option 2', '2', <DesktopOutlined/>),
    getItem('User', 'sub1', <UserOutlined/>, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined/>, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined/>),
];

function App() {
    const [collapsed, setCollapsed] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const fromDate = searchParams.get('fromDate') || '2024-03-07';
    const chatId = searchParams.get('chatId') || '738792308';

    const {data, isLoading} = useGetChatStatsQuery({fromDate, chatId})

    const descriptions = useMemo(() => data ? Object.entries(data).filter(([key]) => !['Диалоги', 'Недели', 'Первые сообщения', 'Рекомендации', 'Имя'].includes(key)) : [], [data])

    const weeks = useMemo(() => !data ? [] : Object.entries(data['Недели']).filter(([key]) => !['Среднее длительность диалога (текстом)', 'От даты', 'Диалоги'].includes(key)).map(([key, values]: any) => ({
        key,
        items: data['Недели']['От даты'].map((time: string, index: number) => ({time, value: values[index]}))
    })), data);

    const columns = [
        {
            title: 'Начал',
            dataIndex: 'start.date',
            key: 'start.date',
            width: '45%',
            render: (_: any, row: any) => <>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 500, fontSize: '1rem'}}>{row.start.sender}</div>
                    <div style={{color: '#686c72', fontSize: '.75rem'}}>{row.start.date}</div>
                </div>
                <div style={{color: 'rgb(112, 117, 121)'}}>{row.start.message}</div>
            </>
        },
        {
            title: 'Закончил',
            dataIndex: 'age',
            key: 'age',
            width: '45%',
            render: (_: any, row: any) => <>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{fontWeight: 500, fontSize: '1rem'}}>{row.end.sender}</div>
                    <div style={{color: '#686c72', fontSize: '.75rem'}}>{row.end.date}</div>
                </div>
                <div style={{color: 'rgb(112, 117, 121)'}}>{row.end.message}</div>
            </>
        },
        {
            title: 'Длительность',
            dataIndex: 'durationHum',
            key: 'durationHum',
        },
    ];

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical"/>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}/>
            </Sider>
            <Layout>
                <Header style={{padding: 0}}/>
                <Content style={{margin: '0 16px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card loading={isLoading} title={data?.['Имя']}>
                        <Descriptions layout="vertical">
                            {descriptions.map((item: any) => <Descriptions.Item
                                label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                            }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                    </Card>
                    <Typography.Title level={3}>Диалоги</Typography.Title>
                    <Table dataSource={data?.['Диалоги'] || []} loading={isLoading} columns={columns}/>
                    <Flex wrap="wrap" gap="small">
                        {weeks.map(w => <div style={{
                            textOverflow: 'ellipsis',
                            width: '400px',
                            overflow: 'hidden'
                        }}>
                            <Typography.Title level={4}>{w.key}</Typography.Title>
                            <Chart items={w.items}/>
                        </div>)}
                    </Flex>
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
}

export default App;
