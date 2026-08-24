import React, {useMemo, useState} from "react";
import SmartTable from "../../../../components/main/table/SmartTable";
import ExcelJS from 'exceljs';
import {saveAs} from 'file-saver';
import TableSummary from "./TableSummary";
import useTableColumns from "../hooks/useTableColumns";
import useProcessedStatistics from "../hooks/useProcessedStatistics";
import {Button} from "antd";
import {FAVORITE_DEALER_IDS} from "./utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowAltCircleUp} from "@fortawesome/free-regular-svg-icons";

export default function PaymentsStatisticsTable({
                                                    statistics,
                                                    loading,
                                                    totalSummary,
                                                    filterModes = {},
                                                    paymentsStatus,
                                                    dictionaries,
                                                    apparatType
                                                }) {
    const [sortConfig, setSortConfig] = useState({ columnKey: undefined, order: undefined });
    const [pagination, setPagination] = useState({ current: 1, pageSize: 100 });

    const handleTableChange = (paginationInfo, filters, sorter) => {
        if (paginationInfo) setPagination({ current: paginationInfo.current, pageSize: paginationInfo.pageSize });
        const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
        setSortConfig({ columnKey: currentSorter?.field || currentSorter?.columnKey, order: currentSorter?.order });
    };

    const textColumnsCount = useMemo(() => 1 + (filterModes.dealer !== "total") + (filterModes.server !== "total") + (filterModes.service !== "total") + (filterModes.apparat !== "total"), [filterModes]);

    const { processedStatistics, ordinarySummary } = useProcessedStatistics({
        statistics, totalSummary, filterModes, paymentsStatus, pagination, apparatType, sortConfig, dictionaries
    });

    const tableColumns = useTableColumns({ sortConfig, filterModes, textColumnsCount, dictionaries, apparatType });

    const isTerminalMode = Number(apparatType) === 1;

    // 1. Точный расчет дохода отдельной строки (если r.total_income еще не был посчитан)
    const getRowIncome = (row) => {
        if (!row) return 0;
        if (row.total_income !== undefined && row.total_income !== null) {
            return Number(row.total_income) || 0;
        }

        const comDlr = Number(row.comDlr || 0);
        const commission = Number(row.commission || 0);
        const pDlr = Number(row.pDlr || 0);
        const pFed = Number(row.pFed || 0);

        if (isTerminalMode) {
            const isFav = FAVORITE_DEALER_IDS.includes(Number(row.dealer_id));
            return isFav ? (commission + pDlr + pFed) : (comDlr + pFed);
        }

        return commission + pDlr + pFed;
    };

    // 2. Безопасное суммирование доходов
    const getIncomeSum = (rows) => {
        return (rows || []).reduce((sum, r) => sum + getRowIncome(r), 0);
    };

    const handleRowClassName = (record) => {
        if (record.isFavSummary) {
            if (record.favSummaryType === "success") return "fw-bold text-success";
            if (record.favSummaryType === "fail") return "fw-bold text-danger";
            return "fw-bold text-primary border-top border-bottom border-secondary";
        }
        return "";
    };

    const handleRowProps = (record) => {
        if (record.isFavSummary) {
            let backgroundColor = "";
            if (record.favSummaryType === "success") backgroundColor = "#f6ffed";
            if (record.favSummaryType === "fail") backgroundColor = "#fff1f0";
            if (record.favSummaryType === "all") backgroundColor = "#e6f7ff";
            return { style: { backgroundColor } };
        }
        return {};
    };

    const handleExportToExcel = async (processedStatistics, ordinarySummary, totalSummary, dictionaries) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Статистика');

        const columnsConfig = [
            { key: 'dealer', label: 'Дилер', condition: filterModes.dealer !== 'total' },
            { key: 'server', label: 'Сервер', condition: filterModes.server !== 'total' },
            { key: 'service', label: 'Сервис', condition: filterModes.service !== 'total' },
            { key: 'apparat', label: 'Аппарат', condition: filterModes.apparat !== 'total' },
            { key: 'status', label: 'Статус', condition: true },
            { key: 'count', label: 'Кол-во', condition: true },
            { key: 'total', label: 'Внесено', condition: true },
            { key: 'real_pay', label: 'Проведено', condition: true },
            { key: 'reduce', label: 'Списано', condition: true },
            { key: 'comDlr', label: 'Комис. QP', condition: true },
            { key: 'commission', label: 'Комиссия дил.', condition: true },
            { key: 'pDlr', label: 'Вознаг. дил.', condition: true },
            { key: 'pFed', label: 'Вознаг. QP', condition: true },
            { key: 'total_income', label: 'Доход', condition: true },
        ].filter(c => c.condition);

        const headers = columnsConfig.map(c => c.label);
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };

        const maps = {
            dealer: new Map(dictionaries?.dealers?.map(d => [String(d.id), d.name]) || []),
            server: new Map(dictionaries?.servers?.map(d => [String(d.id), d.name]) || []),
            service: new Map(dictionaries?.services?.map(d => [String(d.id), d.name]) || []),
            apparat: new Map(dictionaries?.apparats?.map(d => [String(d.id), d.name]) || []),
        };

        const buildDataRow = (row, label = null) => {
            return columnsConfig.map(col => {
                if (label && col.key === 'dealer') return label;
                if (col.key === 'dealer') return maps.dealer.get(String(row.dealer_id)) || row.dealer_id || "";
                if (col.key === 'server') return maps.server.get(String(row.server_id)) || row.server_id || "";
                if (col.key === 'service') return maps.service.get(String(row.service_id)) || row.service_id || "";
                if (col.key === 'apparat') return maps.apparat.get(String(row.apparat_id)) || row.apparat_id || "";
                if (col.key === 'status') return row.payments_status || "";

                if (col.key === 'total_income') return row.total_income !== undefined ? Number(row.total_income || 0) : getRowIncome(row);

                const fields = {
                    count: 'count', total: 'total', real_pay: 'real_pay',
                    reduce: 'reduce', comDlr: 'comDlr', commission: 'commission',
                    pDlr: 'pDlr', pFed: 'pFed'
                };
                return Number(row[fields[col.key]] || 0);
            });
        };

        const sumStats = (rows) => {
            return rows.reduce((acc, r) => {
                Object.keys(r).forEach(k => {
                    if (typeof r[k] === 'number') acc[k] = (acc[k] || 0) + Number(r[k]);
                });
                return acc;
            }, { count: 0, total: 0, real_pay: 0, reduce: 0, comDlr: 0, commission: 0, pDlr: 0, pFed: 0 });
        };

        // Жесткая проверка на чистую строку дилера (исключает любые итоговые и служебные записи)
        const isRealDataRow = (r) => {
            if (!r) return false;
            if (
                r.isSummary ||
                r.isFavSummary ||
                r.isAgentSummary ||
                r.isTotal ||
                r.isTotalSummary ||
                r.isGroupSummary ||
                r.isHeader ||
                r.type === 'summary' ||
                r.type === 'total' ||
                r.type === 'header'
            ) {
                return false;
            }
            if (typeof r.key === 'string' && (r.key.includes('summary') || r.key.includes('total'))) return false;
            if (typeof r.id === 'string' && (r.id.includes('summary') || r.id.includes('total'))) return false;
            return true;
        };

        const pureDataRows = (processedStatistics || []).filter(isRealDataRow);

        let overallIncome = 0;

        if (isTerminalMode) {
            const favDataOnly = pureDataRows.filter(r => FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)));
            const ordinaryRows = pureDataRows.filter(r => !FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)));

            worksheet.addRow([">>> НАША СЕТЬ"]).font = { bold: true };
            favDataOnly.forEach(row => worksheet.addRow(buildDataRow(row)));

            const favTotal = sumStats(favDataOnly);
            const favIncome = getIncomeSum(favDataOnly);
            favTotal.total_income = favIncome;
            worksheet.addRow(buildDataRow(favTotal, "ИТОГО ПО НАШЕЙ СЕТИ")).font = { bold: true };

            worksheet.addRow([]);

            let agencyIncome = 0;
            if (filterModes.dealer !== "total") {
                worksheet.addRow([">>> АГЕНТСКАЯ СЕТЬ"]).font = { bold: true };
                ordinaryRows.forEach(row => worksheet.addRow(buildDataRow(row)));

                const agencyTotal = sumStats(ordinaryRows);
                agencyIncome = getIncomeSum(ordinaryRows);
                agencyTotal.total_income = agencyIncome;
                worksheet.addRow(buildDataRow(agencyTotal, "ИТОГО ПО АГЕНТАМ")).font = { bold: true };
                worksheet.addRow([]);
            } else {
                agencyIncome = getIncomeSum(ordinaryRows);
            }

            // Итоговый доход = Наша сеть + Агентская сеть
            overallIncome = favIncome + agencyIncome;
        } else {
            pureDataRows.forEach(row => worksheet.addRow(buildDataRow(row)));
            overallIncome = getIncomeSum(pureDataRows);
        }

        // ОБЩИЕ ИТОГИ В ЭКСЕЛЬ
        const totalRowData = sumStats(pureDataRows);
        totalRowData.total_income = overallIncome; // Строго сумма категорий без удвоений
        const totalRow = worksheet.addRow(buildDataRow(totalRowData, ">>> ОБЩИЕ ИТОГИ"));
        totalRow.font = { bold: true };

        worksheet.columns.forEach(col => { col.width = 15; });
        worksheet.getColumn(1).width = 30;

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Stat_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" icon={ <FontAwesomeIcon icon={faArrowAltCircleUp}/>} onClick={() => handleExportToExcel(processedStatistics, ordinarySummary, totalSummary, dictionaries)}>
                    Экспорт в Excel
                </Button>
            </div>
            <SmartTable
                data={processedStatistics}
                columns={tableColumns}
                loading={loading}
                size="small"
                rowClassName={handleRowClassName}
                onRow={handleRowProps}
                onChange={handleTableChange}
                scroll={{ x: "max-content", y: "calc(110vh - 300px)" }}
                pagination={{
                    position: ['rightBottom'],
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    pageSizeOptions: ["100", "200", "300", "500", "1000"],
                    showSizeChanger: true,
                }}
                summary={() => (
                    <TableSummary
                        apparatType={apparatType}
                        paymentsStatus={paymentsStatus}
                        textColumnsCount={textColumnsCount}
                        ordinarySummary={ordinarySummary}
                        totalSummary={totalSummary}
                        filterModes={filterModes}
                        processedStatistics={processedStatistics}
                    />
                )}
            />
        </>
    );
}
