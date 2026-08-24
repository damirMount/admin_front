import Head from "next/head";
import React, { useMemo, useState } from "react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import PaymentsFilterForm from "./components/PaymentsFilterForm";
import PaymentsStatisticsTable from "./components/PaymentsStatisticsTable";
import PaymentsStatisticsChart from "./components/PaymentsStatisticsChart";
import PaymentsStatisticsTops from "./components/PaymentsStatisticsTops";
import { useAlert } from "../../../contexts/AlertContext";
import { useSession } from "next-auth/react";
import usePaymentsStatisticActions from "./hooks/usePaymentsStatisticActions";
import usePaymentsStatisticsData from "./hooks/usePaymentsStatisticsData";

export default function PaymentsStatisticsPage() {
    const { openNotification } = useAlert();
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState([]);
    const [filterModes, setFilterModes] = useState({
        dealer: "total",
        server: "total",
        service: "total",
        apparat: "total"
    });
    const [paymentsStatus, setPaymentsStatus] = useState(undefined);

    // ДОБАВЛЕНО: Состояние для хранения выбранного типа аппарата
    const [apparatType, setApparatType] = useState(undefined);

    const { getPaymentsStatistics } = usePaymentsStatisticActions(session, openNotification);
    const { dictionaries } = usePaymentsStatisticsData(session, setLoading);

    const handleSearch = async (formValues, currentModes) => {
        setLoading(true);
        if (currentModes) {
            setFilterModes(currentModes);
        }
        setPaymentsStatus(formValues?.payments_status);

        // ДОБАВЛЕНО: Сохраняем тип аппарата из формы (он приходит в formValues)
        setApparatType(formValues?.apparat_type);

        const resultData = await getPaymentsStatistics(formValues);
        const fetchedStats = resultData || [];

        setStatistics(fetchedStats);
        setLoading(false);
    };

    const totalSummary = useMemo(() => {
        return statistics.reduce((acc, curr) => {
            const isSuccess = String(curr.payments_status || "").toLowerCase() === "success";
            acc.all.count += Number(curr.count || 0);
            acc.all.total += Number(curr.total || 0);
            acc.all.real_pay += Number(curr.real_pay || 0);
            acc.all.real_pay_rur += Number(curr.real_pay_rur || 0);
            acc.all.commission += Number(curr.commission || 0);
            acc.all.reduce += Number(curr.reduce || 0);
            acc.all.comDlr += Number(curr.comDlr || 0);
            acc.all.pDlr += Number(curr.pDlr || 0);
            acc.all.pFed += Number(curr.pFed || 0);
            acc.all.netWriteOff += Number(curr.netWriteOff || 0);
            acc.all.income += Number(curr.income || 0);

            const target = isSuccess ? acc.success : acc.fail;
            target.count += Number(curr.count || 0);
            target.total += Number(curr.total || 0);
            target.real_pay += Number(curr.real_pay || 0);
            target.real_pay_rur += Number(curr.real_pay_rur || 0);
            target.commission += Number(curr.commission || 0);
            target.reduce += Number(curr.reduce || 0);
            target.comDlr += Number(curr.comDlr || 0);
            target.pDlr += Number(curr.pDlr || 0);
            target.pFed += Number(curr.pFed || 0);
            target.netWriteOff += Number(curr.netWriteOff || 0);
            target.income += Number(curr.income || 0);
            return acc;
        }, {
            all: {
                count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0,
                reduce: 0, comDlr: 0, pDlr: 0, pFed: 0, netWriteOff: 0, income: 0
            },
            success: {
                count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0,
                reduce: 0, comDlr: 0, pDlr: 0, pFed: 0, netWriteOff: 0, income: 0
            },
            fail: {
                count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0,
                reduce: 0, comDlr: 0, pDlr: 0, pFed: 0, netWriteOff: 0, income: 0
            }
        });
    }, [statistics]);

    return (
        <ProtectedElement allowedPermissions={"get_statistic"}>
            <div className="container-fluid px-0" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
                <Head>
                    <title>Статистика платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>

                <PaymentsFilterForm
                    onSearch={handleSearch}
                    loading={loading}
                    dictionaries={dictionaries}
                    totalSummary={totalSummary}
                />

                {statistics.length > 0 && (
                    <div className="row">
                        {/* ГРАФИК ДИНАМИКИ */}
                        <div className="col-12 px-2 mb-4">
                            <PaymentsStatisticsChart statistics={statistics} totalSummary={totalSummary} />
                        </div>

                        {/* БЛОК КАРТОЧЕК ТОП (КОМПОНЕНТ ИНКАПСУЛИРОВАН) */}
                        <PaymentsStatisticsTops statistics={statistics} dictionaries={dictionaries} />
                    </div>
                )}

                <div className="pb-4">
                    <PaymentsStatisticsTable
                        statistics={statistics}
                        loading={loading}
                        totalSummary={totalSummary}
                        filterModes={filterModes}
                        paymentsStatus={paymentsStatus}
                        dictionaries={dictionaries}
                        apparatType={apparatType} // <--- ДОБАВЛЕНО: Передаем состояние в таблицу
                    />
                </div>
            </div>
        </ProtectedElement>
    );
}
