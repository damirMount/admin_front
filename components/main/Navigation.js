import React from 'react';
import {useRouter} from "next/router";
import Link from "next/link";

const Navigation = () => {
    const router = useRouter();

    return (
        <div>
            <nav className="navbar navbar-expand-lg ">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Переключатель навигации">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto align-items-center justify-content-center w-100 d-flex mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link href="https://kg.quickpay.kg/idx.php/news" className={`nav-link`}>
                                    Админ зона
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/update-db" className={`nav-link`}>
                                    Обновить БД
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/registries/recipient/index-page" className={`nav-link`}>
                                    Реестры
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link href="/dealer/reports/export" className={`nav-link`}>
                                    Отчёт по истории счётов
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/gsfr/update" className={`nav-link`}>
                                    ГСФР
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/test" className={`nav-link`}>
                                    TEST ZONE
                                </Link>
                            </li>
                            {/*<li className="nav-item">*/}
                            {/*    <Link href="/acquiring/index-page" className={`nav-link`}>*/}
                            {/*        Эквайринг*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navigation;
