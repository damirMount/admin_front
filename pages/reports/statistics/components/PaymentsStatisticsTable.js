import React, { useMemo, useState } from "react";
import SmartTable from "../../../../components/main/table/SmartTable";
import {useTableColumns} from "../hooks/useTableColumns";
import {useProcessedStatistics} from "../hooks/useProcessedStatistics";
import TableSummary from "./TableSummary";


export default function PaymentsStatisticsTable({
                                                    statistics, loading, totalSummary, filterModes = {}, paymentsStatus, dictionaries, apparatType
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

    return (
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
                position: ['rightTop', 'rightBottom'],
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
                />
            )}
        />
    );
}