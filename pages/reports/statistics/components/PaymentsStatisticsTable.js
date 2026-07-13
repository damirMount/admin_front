import React, { useMemo, useState } from "react";
import SmartTable from "../../../../components/main/table/SmartTable";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import TableSummary from "./TableSummary";
import useTableColumns from "../hooks/useTableColumns";
import useProcessedStatistics from "../hooks/useProcessedStatistics";
import { Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { FAVORITE_DEALER_IDS } from "./utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUp, faFileExcel, faFileExport} from "@fortawesome/free-solid-svg-icons";
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

        // 1. Конфигурация столбцов (скрываем то, что в "total")
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

        // Расчет дохода (логика как в TableSummary)
        const getCalculatedIncome = (row, isAgency) => {
            const comDlr = Number(row.comDlr || 0);
            const commission = Number(row.commission || 0);
            const pDlr = Number(row.pDlr || 0);
            const pFed = Number(row.pFed || 0);
            return isAgency ? (comDlr + pFed) : (commission + pDlr + pFed);
        };

        const buildDataRow = (row, label = null) => {
            return columnsConfig.map(col => {
                if (label && col.key === 'dealer') return label;
                if (col.key === 'dealer') return maps.dealer.get(String(row.dealer_id)) || row.dealer_id || "";
                if (col.key === 'server') return maps.server.get(String(row.server_id)) || row.server_id || "";
                if (col.key === 'service') return maps.service.get(String(row.service_id)) || row.service_id || "";
                if (col.key === 'apparat') return maps.apparat.get(String(row.apparat_id)) || row.apparat_id || "";
                if (col.key === 'status') return row.payments_status || "";

                const fields = { count: 'count', total: 'total', real_pay: 'real_pay', reduce: 'reduce', comDlr: 'comDlr', commission: 'commission', pDlr: 'pDlr', pFed: 'pFed', total_income: 'total_income' };
                return Number(row[fields[col.key]] || 0);
            });
        };

        const sumStats = (rows) => {
            return rows.reduce((acc, r) => {
                Object.keys(r).forEach(k => { if (typeof r[k] === 'number') acc[k] = (acc[k] || 0) + Number(r[k]); });
                return acc;
            }, { count: 0, total: 0, real_pay: 0, reduce: 0, comDlr: 0, commission: 0, pDlr: 0, pFed: 0, total_income: 0 });
        };

        const isTerminalMode = Number(apparatType) === 1;

        if (isTerminalMode) {
            const favRows = processedStatistics.filter(r => r.isFavSummary || (isTerminalMode && FAVORITE_DEALER_IDS.includes(Number(r.dealer_id))));
            // Фильтруем только данные, убирая существующие строки summary
            const favDataOnly = favRows.filter(r => !r.isFavSummary);
            const ordinaryRows = processedStatistics.filter(r => !favRows.includes(r));

            const rowHeader = worksheet.addRow([">>> НАША СЕТЬ"]);
            rowHeader.font = { bold: true };

            favDataOnly.forEach(row => worksheet.addRow(buildDataRow(row)));

            const favTotal = sumStats(favDataOnly);
            favTotal.total_income = getCalculatedIncome(favTotal, false);
            const favTotalRow = worksheet.addRow(buildDataRow(favTotal, "ИТОГО ПО НАШЕЙ СЕТИ"));
            favTotalRow.font = { bold: true };

            worksheet.addRow([]);

            if (filterModes.dealer !== "total") {
                const rowAgency = worksheet.addRow([">>> АГЕНТСКАЯ СЕТЬ"]);
                rowAgency.font = { bold: true };
                ordinaryRows.forEach(row => worksheet.addRow(buildDataRow(row)));

                if (ordinarySummary?.all) {
                    const agencyTotal = { ...ordinarySummary.all };
                    agencyTotal.total_income = getCalculatedIncome(agencyTotal, true);
                    const agencyTotalRow = worksheet.addRow(buildDataRow(agencyTotal, "ИТОГО ПО АГЕНТАМ"));
                    agencyTotalRow.font = { bold: true };
                }
                worksheet.addRow([]);
            }
        } else {
            processedStatistics.forEach(row => worksheet.addRow(buildDataRow(row)));
        }

        if (totalSummary?.all) {
            const totalRowData = { ...totalSummary.all };
            totalRowData.total_income = getCalculatedIncome(totalRowData, false);
            const totalRow = worksheet.addRow(buildDataRow(totalRowData, isTerminalMode ? "ИТОГО" : ">>> ОБЩИЕ ИТОГИ"));
            totalRow.font = { bold: true };
        }

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
                    />
                )}
            />
        </>
    );
}
