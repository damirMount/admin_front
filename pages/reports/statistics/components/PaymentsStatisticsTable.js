import React, { useMemo, useState } from "react";
import { Badge, Typography, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faStar } from "@fortawesome/free-solid-svg-icons";
import SmartTable from "../../../../components/main/table/SmartTable";


const { Text } = Typography;

// === КОНФИГУРАЦИЯ ИЗБРАННЫХ ДИЛЕРОВ ===
const FAVORITE_DEALER_IDS = [2210, 3224, 2245, 2168, 2279, 2378, 2578];

export default function PaymentsStatisticsTable({ statistics, loading, totalSummary }) {
    // Состояние для ручного управления сортировкой
    const [sortConfig, setSortConfig] = useState({ columnKey: undefined, order: undefined });

    const handleTableChange = (pagination, filters, sorter) => {
        const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

        if (currentSorter && currentSorter.order) {
            setSortConfig({
                columnKey: currentSorter.field || currentSorter.columnKey,
                order: currentSorter.order
            });
        } else {
            setSortConfig({ columnKey: undefined, order: undefined });
        }
    };

    // Умная кластерная сортировка (сохраняет пары success/fail вместе) + тройной итог избранных
    const processedStatistics = useMemo(() => {
        const favRows = statistics.filter(item => FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));
        const ordinaryRows = statistics.filter(item => !FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));

        const sortGroupedRows = (rows) => {
            const groups = {};
            rows.forEach(row => {
                const groupKey = `${row.dealer_id || ""}-${row.server_id || ""}-${row.service_id || ""}-${row.apparat_id || ""}`;
                if (!groups[groupKey]) groups[groupKey] = [];
                groups[groupKey].push(row);
            });

            const groupArray = Object.keys(groups).map(key => {
                const groupRows = groups[key];
                let sortValue;

                if (!sortConfig.columnKey || !sortConfig.order) {
                    sortValue = key;
                } else {
                    const { columnKey } = sortConfig;
                    if (["count", "total", "real_pay", "commission", "real_pay_rur"].includes(columnKey)) {
                        sortValue = groupRows.reduce((sum, r) => sum + Number(r[columnKey] || 0), 0);
                    } else {
                        let val = groupRows[0]?.[columnKey];

                        if (!val) {
                            if (columnKey === "server_name") val = groupRows[0]?.server_id;
                            else if (columnKey === "service_name") val = groupRows[0]?.service_id;
                            else if (columnKey === "apparat_name") val = groupRows[0]?.apparat_id;
                            else if (columnKey === "dealer_name") val = groupRows[0]?.dealer_id;
                        }

                        sortValue = String(val || "");
                    }
                }

                const sortedGroupRows = [...groupRows].sort((a, b) => {
                    const statusA = String(a.payments_status || "").toLowerCase();
                    const statusB = String(b.payments_status || "").toLowerCase();
                    if (statusA === "success" && statusB !== "success") return -1;
                    if (statusA !== "success" && statusB === "success") return 1;
                    return statusA.localeCompare(statusB);
                });

                return { sortValue, rows: sortedGroupRows };
            });

            if (sortConfig.columnKey && sortConfig.order) {
                const { columnKey, order } = sortConfig;
                const isAsc = order === "ascend";

                groupArray.sort((a, b) => {
                    if (["count", "total", "real_pay", "commission", "real_pay_rur"].includes(columnKey)) {
                        return isAsc ? a.sortValue - b.sortValue : b.sortValue - a.sortValue;
                    }

                    return isAsc
                        ? String(a.sortValue).localeCompare(String(b.sortValue), 'ru', { numeric: true, sensitivity: 'base' })
                        : String(b.sortValue).localeCompare(String(a.sortValue), 'ru', { numeric: true, sensitivity: 'base' });
                });
            }

            return groupArray.flatMap(g => g.rows);
        };

        const sortedFavs = sortGroupedRows(favRows);
        const sortedOrdinary = sortGroupedRows(ordinaryRows);

        if (favRows.length === 0) return sortedOrdinary;

        const favSummary = favRows.reduce((acc, curr) => {
            const isSuccess = String(curr.payments_status || "").toLowerCase() === "success";

            acc.all.count += Number(curr.count || 0);
            acc.all.total += Number(curr.total || 0);
            acc.all.real_pay += Number(curr.real_pay || 0);
            acc.all.real_pay_rur += Number(curr.real_pay_rur || 0);
            acc.all.commission += Number(curr.commission || 0);

            const target = isSuccess ? acc.success : acc.fail;
            target.count += Number(curr.count || 0);
            target.total += Number(curr.total || 0);
            target.real_pay += Number(curr.real_pay || 0);
            target.real_pay_rur += Number(curr.real_pay_rur || 0);
            target.commission += Number(curr.commission || 0);

            return acc;
        }, {
            all: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 },
            success: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 },
            fail: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 }
        });

        const favSummaryRows = [
            { key: "fav-summary-row-success", isFavSummary: true, favSummaryType: "success", ...favSummary.success },
            { key: "fav-summary-row-fail", isFavSummary: true, favSummaryType: "fail", ...favSummary.fail },
            { key: "fav-summary-row-all", isFavSummary: true, favSummaryType: "all", ...favSummary.all }
        ];

        return [...sortedFavs, ...favSummaryRows, ...sortedOrdinary];
    }, [statistics, sortConfig]);

    const formatCurrency = (value, currency = "KGS") => {
        const num = Number(value || 0);
        return (
            <span className="fw-bold">
                {num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-muted small ms-1">{currency}</span>
            </span>
        );
    };


    const renderDimensionCell = (idKey, nameKey) => (text, record) => {
        if (record.isFavSummary) return "";
        const id = record[idKey];
        const name = record[nameKey];

        if (!id || id === "total") return <Text type="secondary" italic className="small">Сводно</Text>;
        if (id === "all") return <Badge status="processing" text="Все элементы" />;
        return name ? <span className="small">{id} | {name}</span> : <span className="small">{id}</span>;
    };

    const tableColumns = useMemo(() => [
        {
            title: "Дилер",
            dataIndex: "dealer_name",
            key: "dealer_name",
            sorter: true,
            sortOrder: sortConfig.columnKey === "dealer_name" ? sortConfig.order : undefined,
            render: (text, record) => {
                if (record.isFavSummary) {
                    if (record.favSummaryType === "success") return <Badge status="success" text={<Text strong className="text-success">★ Избранные: Успешные платежи</Text>} />;
                    if (record.favSummaryType === "fail") return <Badge status="error" text={<Text strong className="text-danger">★ Избранные: Ошибочные платежи</Text>} />;
                    return <Text strong className="text-primary">★ Всего по избранным дилерам</Text>;
                }
                const id = record.dealer_id;
                const name = record.dealer_name;
                const isFav = FAVORITE_DEALER_IDS.includes(Number(id));

                if (!id || id === "total") return <Text type="secondary" italic className="small">Сводно</Text>;
                if (id === "all") return <Badge status="processing" text="Все элементы" />;

                return (
                    <span className="small d-inline-flex align-items-center gap-1">
                        {isFav && <FontAwesomeIcon icon={faStar} className="text-warning me-1" title="Избранный дилер" />}
                        {name ? `${id} | ${name}` : id}
                    </span>
                );
            },
        },
        {
            title: "Сервер",
            dataIndex: "server_name",
            key: "server_name",
            sorter: true,
            sortOrder: sortConfig.columnKey === "server_name" ? sortConfig.order : undefined,
            render: renderDimensionCell("server_id", "server_name"),
        },
        {
            title: "Сервис",
            dataIndex: "service_name",
            key: "service_name",
            sorter: true,
            sortOrder: sortConfig.columnKey === "service_name" ? sortConfig.order : undefined,
            render: renderDimensionCell("service_id", "service_name"),
        },
        {
            title: "Аппарат",
            dataIndex: "apparat_name",
            key: "apparat_name",
            sorter: true,
            sortOrder: sortConfig.columnKey === "apparat_name" ? sortConfig.order : undefined,
            render: renderDimensionCell("apparat_id", "apparat_name"),
        },
        {
            title: "Статус",
            dataIndex: "payments_status",
            key: "payments_status",
            render: (val, record) => {
                if (record.isFavSummary) return "";
                if (val === "success") return <Badge status="success" text="Success" />;
                if (val === "fail") return <Badge status="error" text="Fail" />;
                return <span className="text-muted">{val}</span>;
            },
        },
        {
            title: "Кол-во",
            dataIndex: "count",
            key: "count",
            align: "right",
            sorter: true,
            sortOrder: sortConfig.columnKey === "count" ? sortConfig.order : undefined,
            render: (val) => <span className="text-muted">{Number(val || 0).toLocaleString("ru-RU")} ед.</span>,
        },
        {
            title: "Внесено",
            dataIndex: "total",
            key: "total",
            align: "right",
            sorter: true,
            sortOrder: sortConfig.columnKey === "total" ? sortConfig.order : undefined,
            render: (val) => formatCurrency(val),
        },
        {
            title: "Проведено",
            dataIndex: "real_pay",
            key: "real_pay",
            align: "right",
            sorter: true,
            sortOrder: sortConfig.columnKey === "real_pay" ? sortConfig.order : undefined,
            render: (val) => formatCurrency(val),
        },
        {
            title: "Комиссия",
            dataIndex: "commission",
            key: "commission",
            align: "right",
            sorter: true,
            sortOrder: sortConfig.columnKey === "commission" ? sortConfig.order : undefined,
            render: (val) => formatCurrency(val),
        },
        {
            title: "Инстр. валюте",
            dataIndex: "real_pay_rur",
            key: "real_pay_rur",
            align: "right",
            sorter: true,
            sortOrder: sortConfig.columnKey === "real_pay_rur" ? sortConfig.order : undefined,
            render: (val) => formatCurrency(val, <FontAwesomeIcon icon={faCoins}/>),
        },
    ], [sortConfig]);

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
            pagination={{
                defaultPageSize: 50,
                pageSizeOptions: ["25", "50", "100"],
                showSizeChanger: true,
            }}
            summary={() => (
                <Table.Summary fixed="bottom">
                    <Table.Summary.Row style={{ backgroundColor: "#f6ffed" }}>
                        <Table.Summary.Cell index={0} colSpan={5}>
                            <Badge status="success" text={<Text strong className="text-success">Итого успешных платежей</Text>} />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong>{totalSummary.success.count.toLocaleString("ru-RU")} ед.</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">{formatCurrency(totalSummary.success.total)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">{formatCurrency(totalSummary.success.real_pay)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right">{formatCurrency(totalSummary.success.commission)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={5} align="right">{formatCurrency(totalSummary.success.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                    </Table.Summary.Row>

                    <Table.Summary.Row style={{ backgroundColor: "#fff1f0" }}>
                        <Table.Summary.Cell index={0} colSpan={5}>
                            <Badge status="error" text={<Text strong className="text-danger">Итого ошибочных платежей</Text>} />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong>{totalSummary.fail.count.toLocaleString("ru-RU")} ед.</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">{formatCurrency(totalSummary.fail.total)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">{formatCurrency(totalSummary.fail.real_pay)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right">{formatCurrency(totalSummary.fail.commission)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={5} align="right">{formatCurrency(totalSummary.fail.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                    </Table.Summary.Row>

                    <Table.Summary.Row style={{ backgroundColor: "#e6f7ff", fontWeight: "bold" }}>
                        <Table.Summary.Cell index={0} colSpan={5}>
                            <Text strong className="text-primary">💸 ОБЩИЙ ИТОГ (Все статусы)</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                            <Text strong>{totalSummary.all.count.toLocaleString("ru-RU")} ед.</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">{formatCurrency(totalSummary.all.total)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">{formatCurrency(totalSummary.all.real_pay)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right">{formatCurrency(totalSummary.all.commission)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={5} align="right">{formatCurrency(totalSummary.all.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                    </Table.Summary.Row>
                </Table.Summary>
            )}
        />
    );
}