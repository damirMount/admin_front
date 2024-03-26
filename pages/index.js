import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {faHandHoldingDollar, faLandmark, faMoneyBillTrendUp, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import Link from "next/link";
import {
    OLD_ADMIN_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL
} from "../routes/web";
import ProtectedElement from "../components/main/system/ProtectedElement";


export default function Home() {

    return (
        <div>
            <Head>
                <title>Главная страница | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <ProtectedElement allowedPermissions={'second_test_permission'} redirect={false}>
                <div>
                    <h1>Главная страница</h1>
                </div>
            </ProtectedElement>
            <div className='d-flex justify-content-between'>
                <div className="w-75">
                    {/*<h3>Новости</h3>*/}
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        <div className="col">
                            <div className="card h-100">

                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title">Перезапуск реестров</h5>
                                        <p>Здесь вы можете в ручную оставить реестры по конкретному сервису</p>
                                    </div>
                                    <Link className="btn btn-purple " href={REGISTRY_RESEND_URL}>Перейти</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card h-100">

                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title">Отчёт по истории счётов дилеров</h5>
                                        <p>Возможность выгрузки истории счёта по всем дилерам</p>
                                    </div>
                                    <Link className="btn btn-purple "
                                          href={REPORT_DEALERS_ACCOUNT_HISTORY_URL}>Перейти</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card h-100">

                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title">Реестры</h5>
                                        <p>Старинца ежедневных реестров</p>
                                    </div>
                                    <Link className="btn btn-purple " href={REGISTRY_INDEX_URL}>Перейти</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card h-100">

                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title">Старая админ зона</h5>
                                        <p>Вернуться в старую админ зону</p>
                                    </div>
                                    <Link className="btn btn-purple " href={OLD_ADMIN_URL}>Перейти</Link>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <div className="w-25 ms-4">
                    {/*<h3>Статистика</h3>*/}
                    <div className="card">
                        <div className="card-body">
                            <div className="ms-2">
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faHandHoldingDollar} size="2xl" className='color-purple'/>
                                    <div className="ms-3 d-flex flex-column">
                                        <h5 className="card-title text-secondary">Баланс дилеров</h5>
                                        <h5 className="card-text">12314234 сом</h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mt-4 ">
                                    <FontAwesomeIcon icon={faLandmark} size="2xl" className='color-purple'/>
                                    <div className="ms-3 d-flex flex-column">
                                        <h5 className="card-title text-secondary">Долги дилеров</h5>
                                        <h5 className="card-text">123 142 343,4 сом</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                            <div className="ms-2">
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faMoneyBillTrendUp} size="2xl" className='color-purple'/>
                                    <div className="ms-3 d-flex flex-column">
                                        <h5 className="card-title text-secondary">За сегодня</h5>
                                        <h5 className="card-text">12,314 платежей</h5>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mt-4 ">
                                    <FontAwesomeIcon icon={faSackDollar} size="2xl" className='color-purple'/>
                                    <div className="ms-3 d-flex flex-column">
                                        <h5 className="card-title text-secondary">Проведено</h5>
                                        <h5 className="card-text">123 142 34 сом</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
