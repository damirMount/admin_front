import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {faHandHoldingDollar, faLandmark, faMoneyBillTrendUp, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import Link from "next/link";
import {
    OLD_ADMIN_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL,
    REPORT_SERVICES_NORTH_ELECTRO_URL
} from "../routes/web";
import ProtectedElement from "../components/main/system/ProtectedElement";
import {Badge, Statistic} from "antd";


export default function Home() {

    const config = {
        data: {
            type: 'fetch',
            value: 'https://assets.antv.antgroup.com/g2/stocks.json',
            transform: [{type: 'filter', callback: (d) => d.symbol === 'GOOG'}],
        },
        xField: 'date',
        yField: 'price',
        style: {
            fill: `linear-gradient(-90deg, white 0%, darkblue 100%)`,
        },
        axis: {
            y: {labelFormatter: ''},
        },

        line: {
            style: {
                stroke: 'darkblue',
                strokeWidth: 2,
            },
        },
    };

    return (
        <div>
            <Head>
                <title>Главная страница | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Главная страница</h1>
            </div>
            <div className='d-flex justify-content-between'>
                <div className="w-75">
                    {/*<h3>Новости</h3>*/}
                    {/*<ChartArea config={config} />*/}
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        <ProtectedElement allowedPermissions={'reports_management'} redirect={false}>
                            <div className="col">
                                <div className="card h-100">
                                    <Badge.Ribbon text="Новое" color={"red"} className={'mt-0'}>
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <h5 className="card-title">Итоговый отчёт по Северэлектро</h5>
                                            <p>Статистика платежей по всем РЭС Северэлектро</p>
                                            <Link className="btn btn-purple "
                                                  href={REPORT_SERVICES_NORTH_ELECTRO_URL}>Перейти</Link>
                                        </div>
                                    </Badge.Ribbon>
                                </div>
                            </div>
                        </ProtectedElement>
                        <ProtectedElement allowedPermissions={'registry_management'} redirect={false}>
                            <div className="col">
                                <div className="card h-100">
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <h5 className="card-title">Перезапуск реестров</h5>
                                        <p>Здесь вы можете в ручную оставить реестры по конкретному сервису</p>
                                        <Link className="btn btn-purple " href={REGISTRY_RESEND_URL}>Перейти</Link>
                                    </div>
                                </div>
                            </div>
                        </ProtectedElement>
                        <ProtectedElement allowedPermissions={'reports_management'} redirect={false}>
                            <div className="col">
                                <div className="card h-100">

                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <h5 className="card-title">Отчёт по истории счётов дилеров</h5>
                                        <p>Возможность выгрузки истории счёта по всем дилерам</p>
                                        <Link className="btn btn-purple "
                                              href={REPORT_DEALERS_ACCOUNT_HISTORY_URL}>Перейти</Link>
                                    </div>
                                </div>
                            </div>
                        </ProtectedElement>
                        <ProtectedElement allowedPermissions={'registry_management'} redirect={false}>
                            <div className="col">
                                <div className="card h-100">
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <h5 className="card-title">Реестры</h5>
                                        <p>Старинца ежедневных реестров</p>
                                        <Link className="btn btn-purple " href={REGISTRY_INDEX_URL}>Перейти</Link>
                                    </div>
                                </div>
                            </div>
                        </ProtectedElement>
                        <div className="col">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <h5 className="card-title">Старая админ зона</h5>
                                    <p>Вернуться в старую админ зону</p>
                                    <Link className="btn btn-purple " href={OLD_ADMIN_URL}>Перейти</Link>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <div className="w-25 ms-4 text-nowrap">
                    {/*<h3>Статистика</h3>*/}
                    <div className="card">
                        <div className="card-body">
                            <Statistic prefix={
                                <FontAwesomeIcon icon={faHandHoldingDollar} className='color-purple me-2'/>
                            } title="Баланс" value={1234567} precision={2} suffix={'сом'}
                            />
                            <Statistic prefix={
                                <FontAwesomeIcon icon={faLandmark} className='color-purple me-2'/>
                            } title="Кредит" value={1234567} precision={2} suffix={'сом'}
                            />
                        </div>
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                            <Statistic prefix={
                                <FontAwesomeIcon icon={faMoneyBillTrendUp} className='color-purple me-2'/>
                            } title="Сегодня принято платежей" value={123456} suffix={'шт.'}
                            />
                            <Statistic prefix={
                                <FontAwesomeIcon icon={faSackDollar} className='color-purple me-2'/>
                            } title="Проведено" value={1234567} precision={2} suffix={'сом'}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
