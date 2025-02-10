import Head from "next/head";
import {
    OLD_ADMIN_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL,
    REPORT_SERVICES_NORTH_ELECTRO_URL
} from "../routes/web";
import ProtectedElement from "../components/main/system/ProtectedElement";
import {Badge, Button} from "antd";
import PaymentsChart from "../components/main/charts/PaymentsChart";

export default function Home() {
    return (
        <div>
            <Head>
                <title>Главная страница | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <PaymentsChart/>
            <div className="row row-cols-1 row-cols-md-4 g-4 mt-3">
                <ProtectedElement allowedPermissions={'reports_management'} redirect={false}>
                    <div className="col">
                        <div className="card h-100">
                            <Badge.Ribbon text="Новое" color={"red"}>
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
    );
}
