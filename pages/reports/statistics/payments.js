import Head from "next/head";
import React from "react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import PaymentsFilterForm from "./components/PaymentsFilterForm";
import {Card, Col, Divider, Row, Space, Statistic, Typography} from "antd";
import PaymentTimelineChart from "../../../components/main/charts/PaymentTimelineChart";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoins, faWallet} from "@fortawesome/free-solid-svg-icons";
import MoneyColumn from "../../../components/main/system/MoneyColumn";


const {Title, Text} = Typography;
export default function PaymentsStatisticsPage() {

    return (
        <ProtectedElement allowedPermissions={'reports_management'}>
            <div>
                <Head>
                    <title>Статистика платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <PaymentsFilterForm/>
                <div>
                    <Title level={3}>Статистика платежей</Title>
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                        <Statistic precision={2} className='icon-large' title="Проведено" value={112893} suffix={'KGS'} />
                            <Statistic title="Платежей" value={112893} suffix={'KGS'} />
                        </Col>

                        <Col span={12}>
                            <div className="p-3 rounded-3 h-100 bg-light border">
                                <Text type="secondary" className="label-medium">
                                    <Space><FontAwesomeIcon icon={faWallet}/>Сервис</Space>
                                </Text>
                                <div className="d-flex align-items-top justify-content-between h-75">
                                    <div className="mt-2 mb-2 d-flex flex-column gap-1 mb-3 w-50 ">
                                        <Text strong>Успешных</Text>
                                        <div className="d-flex align-items-top justify-content-between w-100">
                                            <div className='d-flex flex-column'>
                                                <Text type="secondary">Платежей</Text>
                                                <Text type="secondary">Внесено</Text>
                                                <Text type="secondary">Проведено</Text>
                                                <Text type="secondary">Комиссия</Text>
                                                <Text type="secondary">Иностр. валюта</Text>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="mt-2 mb-2 d-flex flex-column gap-1 mb-3 w-50">
                                        <Text strong>Ошибочных</Text>
                                        <div className="d-flex align-items-top justify-content-between w-100">
                                            <div className='d-flex flex-column'>
                                                <Text type="secondary">Платежей</Text>
                                                <Text type="secondary">Внесено</Text>
                                                <Text type="secondary">Проведено</Text>
                                                <Text type="secondary">Комиссия</Text>
                                                <Text type="secondary">Иностр. валюта</Text>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                    <MoneyColumn
                                        label="Всего платежей"
                                        value={0}
                                        prefix={''}
                                    />
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="Внесено" value={0}/>
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="Проведено" value={0} color="#52c41a"/>
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="Комиссия" value={0}/>
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn
                                        label="Иностр. валюта"
                                        value={0}
                                        prefix={<FontAwesomeIcon icon={faCoins}/>}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <Card title="Динамика за 30 дней" className='shadow-sm' size="small">
                                <PaymentTimelineChart payments={[]} token={[]}/>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Card>
                    <Title level={3}>Топ дилеров</Title>
                </Card>
                <Card>
                    <Title level={3}>Топ сервисов</Title>
                </Card>
                <Card>
                    <Title level={3}>Топ точек</Title>
                </Card>
            </div>
        </ProtectedElement>
    )
}