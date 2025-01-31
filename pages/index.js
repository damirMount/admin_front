import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoneyBillTrendUp, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import {
    OLD_ADMIN_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL,
    REPORT_SERVICES_NORTH_ELECTRO_URL
} from "../routes/web";
import ProtectedElement from "../components/main/system/ProtectedElement";
import {Badge, Button, Statistic} from "antd";
import ChartArea from "../components/main/charts/ChartArea";
import DealerBalance from "../components/main/statistic/DealerBalance";
import {GET_PAYMENTS_STATISTIC_API} from "../routes/api";
import {useAlert} from "../contexts/AlertContext";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import PaymentsChart from "../components/main/charts/PaymentsChart";
import PaymetnsToday from "../components/main/statistic/PaymetnsToday";


export default function Home() {



    return (
        <div>
            <Head>
                <title>Главная страница | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Главная страница</h1>
            </div>
            <div className='d-flex justify-content-between'>
                <div className="w-75 d-flex flex-column">
                    <PaymentsChart/>

                    <div className="row row-cols-1 row-cols-md-3 g-4 mt-3">
                        <ProtectedElement allowedPermissions={'reports_management'} redirect={false}>
                            <div className="col">
                                <div className="card h-100">
                                    <Badge.Ribbon text="Новое" color={"red"} className={'mt-0'}>
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <h5 className="card-title">Итоговый отчёт по Северэлектро</h5>
                                            <p>Статистика платежей по всем РЭС Северэлектро</p>
                                            <Button type="primary"
                                                    href={REPORT_SERVICES_NORTH_ELECTRO_URL}>Перейти</Button>
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
                                        <Button type="primary" href={REGISTRY_RESEND_URL}>Перейти</Button>
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
                                        <Button type="primary"
                                                href={REPORT_DEALERS_ACCOUNT_HISTORY_URL}>Перейти</Button>
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
                                        <Button type="primary" href={REGISTRY_INDEX_URL}>Перейти</Button>
                                    </div>
                                </div>
                            </div>
                        </ProtectedElement>
                        <div className="col">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <h5 className="card-title">Старая админ зона</h5>
                                    <p>Вернуться в старую админ зону</p>
                                    <Button type="primary" href={OLD_ADMIN_URL}>Перейти</Button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <div className="w-25 ms-4 text-nowrap">
                    {/*<h3>Статистика</h3>*/}
                    <DealerBalance/>
                    <PaymetnsToday/>
                </div>
            </div>

        </div>
    );
}
