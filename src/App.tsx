import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import type {DatePickerProps, MenuProps} from 'antd';
import {
    Breadcrumb,
    Card,
    DatePicker,
    Descriptions, Divider,
    Flex, Form,
    Layout,
    Menu,
    Select,
    Space,
    Table,
    theme,
    Typography
} from 'antd';
import {useGetChatStatsQuery} from "./services/strategies";
import {useSearchParams} from "react-router-dom";
import {createChart} from "lightweight-charts";
import Chart from "./Chart";
import dayjs from 'dayjs';
import FormItem from "antd/es/form/FormItem";

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

    const [search, setSearch] = useState(chatId);

    const {data, isFetching: isLoading} = useGetChatStatsQuery({fromDate, chatId})

    const descriptions = useMemo(() => data ? Object.entries(data).filter(([key]) => !['Диалоги', 'Дни', 'Недели', 'Первые сообщения', 'Рекомендации', 'Имя'].includes(key)) : [], [data])

    const days = useMemo(() => (!data) ? [] : Object.entries(data['Дни']).filter(([key]) => !['Среднее длительность диалога (текстом)', 'Прошло с последнего сообщения от отправителя (часов)', 'От даты', 'Диалоги', 'Средняя длительность общения в день (текстом)'].includes(key)).map(([key, values]: any) => ({
        key,
        items: data['Дни']['От даты'].map((time: string, index: number) => ({time, value: values[index]}))
    })), data);

    const weeks = useMemo(() => (!data) ? [] : Object.entries(data['Недели']).filter(([key]) => !['Среднее длительность диалога (текстом)', 'Прошло с последнего сообщения от отправителя (часов)', 'От даты', 'Диалоги', 'Средняя длительность общения в день (текстом)'].includes(key)).map(([key, values]: any) => ({
        key,
        items: data['Недели']['От даты'].map((time: string, index: number) => ({time, value: values[index]}))
    })), data);

    const [ids, setIds] = useState<string[]>(localStorage.getItem('ids') ? JSON.parse(localStorage.getItem('ids')!) : [])

    const saveId = (id: string) => {
        setIds((prev: any) => {
            const newArr = Array.from(new Set([...prev, id]));
            localStorage.setItem('ids', JSON.stringify(newArr));

            return newArr;
        });
    }

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

    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        searchParams.set('fromDate', dateString.toString())

        setSearchParams(searchParams)
    };

    const commonKeys = [
'От даты',
        'Сообщений получено',
        'Сообщений отправлено',
        'Сколько дней общаемся',
        'Сообщений получено в день',
        'Сообщений отправлено в день'
    ]

    const photoKeys = [
        'Фото отправлено',
        'Фото отправлено в день',
        'Фото получено',
        'Фото получено в день'
    ]

    const audioKeys = [
        'Аудио отправлено',
        'Аудио отправлено в день',
        'Аудио получено',
        'Аудио получено в день',
        'Ср. длина аудио отправлено',
        'Ср. длина аудио отправлено в день',
        'Ср. длина аудио получено',
        'Ср. длина аудио получено в день'
    ]

    const videoKeys = [
        'Видео отправлено',
        'Видео получено',
        'Кружочков отправлено',
        'Кружочков отправлено в день',
        'Кружочков получено',
        'Кружочков получено в день',
        'Ср. длина кружочка отправлено',
        'Ср. длина кружочка отправлено в день',
        'Ср. длина кружочка получено',
        'Ср. длина кружочка получено в день',
        'Ср. длина видео отправлено',
        'Ср. длина видео отправлено в день',
        'Ср. длина видео получено',
        'Ср. длина видео получено в день'
    ]

    function onSearch(val: string) {
        setSearch(val)
    }

    const handleKeyPress = (event: any) => {
        if(event.key === 'Enter' && search){
            searchParams.set('chatId', search);
            setSearchParams(searchParams);

            saveId(search);
        }
    }

    const weekMainMetrics = [
'Сообщений получено',
        // 'Сообщений отправлено',
        'Текстовых сообщений получено',
        // 'Текстовых сообщений отправлено',
        'Сообщений получено в день',
        // 'Сообщений отправлено в день',
        'Видео получено',
        // 'Видео отправлено',
        'Кружочков получено',
        // 'Кружочков отправлено',
        'Кружочков получено в день',
        // 'Кружочков отправлено в день',
        'Аудио получено',
        // 'Аудио отправлено',
        'Аудио получено в день',
        // 'Аудио отправлено в день',
        "Средняя длительность общения в день",
        'Фото получено',
        // 'Фото отправлено',
        'Фото получено в день',
        // 'Фото отправлено в день',
    ]

    const weekInterest = useMemo(() => (!data || !data['Недели']) ? undefined : {
        key: 'Интерес по сообщениям',
        items: data['Недели']['От даты'].map((time: string, index: number) => ({time, value: data['Недели']['Сообщений получено'][index] / (data['Недели']['Сообщений получено'][index] + data['Недели']['Сообщений отправлено'][index])}))
    }, [data]);

    const dayInterest = useMemo(() => (!data || !data['Дни']) ? undefined : {
        key: 'Интерес по сообщениям',
        items: data['Дни']['От даты'].map((time: string, index: number) => ({time, value: data['Дни']['Сообщений получено'][index] / (data['Дни']['Сообщений получено'][index] + data['Дни']['Сообщений отправлено'][index])}))
    }, [data]);

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical"/>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}/>
            </Sider>
            <Layout>
                <Header style={{padding: 0}}/>
                <Content style={{margin: '0 16px'}}>
                    <Form style={{margin: '24px 0 0', display: 'flex', gap: '16px'}}>
                        <FormItem label="ID аккаунта">
                            <Select
                                showSearch
                                value={search}
                                placeholder="Введи айди диалога"
                                onSearch={onSearch}
                                onKeyDown={handleKeyPress}
                                options={ids.map(i => ({value: i, label: i}))}
                            />
                        </FormItem>
                        <FormItem label="Дата первого сообщения">
                            <DatePicker onChange={onChange} value={dayjs(fromDate, "YYYY-MM-DD")}/>
                        </FormItem>
                    </Form>
                    <Card loading={isLoading} title={data?.['Имя']}>
                        <Descriptions layout="vertical" title="Общее">
                            {descriptions.filter(([key]) => commonKeys.includes(key)).map((item: any) =>
                                <Descriptions.Item
                                    label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2
                                }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                        <Divider/>
                        <Descriptions layout="vertical" title="Фото">
                            {descriptions.filter(([key]) => photoKeys.includes(key)).map((item: any) =>
                                <Descriptions.Item
                                    label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2
                                }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                        <Divider/>
                        <Descriptions layout="vertical" title="Аудио">
                            {descriptions.filter(([key]) => audioKeys.includes(key)).map((item: any) =>
                                <Descriptions.Item
                                    label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2
                                }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                        <Divider/>
                        <Descriptions layout="vertical" title="Видео">
                            {descriptions.filter(([key]) => videoKeys.includes(key)).map((item: any) =>
                                <Descriptions.Item
                                    label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2
                                }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                        <Divider/>
                        <Descriptions layout="vertical" title="Разное">
                            {descriptions.filter(([key]) => !videoKeys.includes(key) && !photoKeys.includes(key) && !audioKeys.includes(key) && !commonKeys.includes(key)).map((item: any) => <Descriptions.Item
                                label={item[0]}>{typeof item[1] === 'number' ? new Intl.NumberFormat('eu-EU', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                            }).format(item[1]) : item[1]}</Descriptions.Item>)}
                        </Descriptions>
                    </Card>
                    <Typography.Title level={3}>Диалоги</Typography.Title>
                    <Table dataSource={data?.['Диалоги'] || []} loading={isLoading} columns={columns}/>
                    {data && data['Сколько дней общаемся'] >=7 && <>
                        <Typography.Title level={3}>Основные метрики (недели)</Typography.Title>
                        <Flex wrap="wrap" gap="small">
                            {weekInterest && <div key={weekInterest.key} style={{
                                textOverflow: 'ellipsis',
                                width: '400px',
                                overflow: 'hidden'
                            }}>
                                <Typography.Title level={4}>{weekInterest.key}</Typography.Title>
                                <Chart items={weekInterest.items}/>
                            </div>}
                            {weeks.filter(({key}) => weekMainMetrics.includes(key)).map(w => <div key={w.key} style={{
                                textOverflow: 'ellipsis',
                                width: '400px',
                                overflow: 'hidden'
                            }}>
                                <Typography.Title level={4}>{w.key}</Typography.Title>
                                <Chart items={w.items}/>
                            </div>)}
                        </Flex>
                    </>}
                    {data && data['Сколько дней общаемся'] >=7 && <>
                        <Typography.Title level={3}>Основные метрики (дни)</Typography.Title>
                        <Flex wrap="wrap" gap="small">
                            {dayInterest && <div key={dayInterest.key} style={{
                                textOverflow: 'ellipsis',
                                width: '400px',
                                overflow: 'hidden'
                            }}>
                                <Typography.Title level={4}>{dayInterest.key}</Typography.Title>
                                <Chart items={dayInterest.items}/>
                            </div>}
                            {days.filter(({key}) => weekMainMetrics.includes(key)).map(w => <div key={w.key} style={{
                                textOverflow: 'ellipsis',
                                width: '400px',
                                overflow: 'hidden'
                            }}>
                                <Typography.Title level={4}>{w.key}</Typography.Title>
                                <Chart items={w.items}/>
                            </div>)}
                        </Flex>
                    </>}
                    {data && data['Сколько дней общаемся'] >=7 && <>
                        <Typography.Title level={3}>Спорные метрики</Typography.Title>
                        <Flex wrap="wrap" gap="small">
                            {weeks.filter(({key}) => !weekMainMetrics.includes(key)).map(w => <div key={w.key} style={{
                                textOverflow: 'ellipsis',
                                width: '400px',
                                overflow: 'hidden'
                            }}>
                                <Typography.Title level={4}>{w.key}</Typography.Title>
                                <Chart items={w.items}/>
                            </div>)}
                        </Flex>
                    </>}
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
}

export default App;
