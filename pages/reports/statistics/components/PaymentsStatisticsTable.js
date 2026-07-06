import React, {useMemo, useState} from "react";
import {Badge, Table, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoins, faStar} from "@fortawesome/free-solid-svg-icons";
import SmartTable from "../../../../components/main/table/SmartTable";

const {Text} = Typography;
const FAVORITE_DEALER_IDS = [2210, 3224, 2245, 2168, 2279, 2378, 2578, 3514];

export default function PaymentsStatisticsTable({
                                                    statistics,
                                                    loading,
                                                    totalSummary,
                                                    filterModes = {},
                                                    paymentsStatus,
                                                    dictionaries
                                                }) {
    const [sortConfig, setSortConfig] = useState({columnKey: undefined, order: undefined});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

    const handleTableChange = (paginationInfo, filters, sorter) => {
        if (paginationInfo) {
            setPagination({
                current: paginationInfo.current || 1,
                pageSize: paginationInfo.pageSize || 50
            });
        }

        const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
        if (currentSorter && currentSorter.order) {
            setSortConfig({
                columnKey: currentSorter.field || currentSorter.columnKey,
                order: currentSorter.order
            });
        } else {
            setSortConfig({columnKey: undefined, order: undefined});
        }
    };

    const textColumnsCount = useMemo(() => {
        let count = 1; // Учитывает колонку "Статус", которая есть всегда
        if (filterModes.dealer !== "total") count++;
        if (filterModes.server !== "total") count++;
        if (filterModes.service !== "total") count++;
        if (filterModes.apparat !== "total") count++;
        return count;
    }, [filterModes]);

    const processedStatistics = useMemo(() => {
        const favRows = statistics.filter(item => FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));
        const ordinaryRows = statistics.filter(item => !FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));

        // Группировка и сортировка базовых строк данных
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
                    const {columnKey} = sortConfig;
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

                return {sortValue, rows: sortedGroupRows};
            });

            if (sortConfig.columnKey && sortConfig.order) {
                const {columnKey, order} = sortConfig;
                const isAsc = order === "ascend";

                groupArray.sort((a, b) => {
                    if (["count", "total", "real_pay", "commission", "real_pay_rur"].includes(columnKey)) {
                        return isAsc ? a.sortValue - b.sortValue : b.sortValue - a.sortValue;
                    }
                    return isAsc
                        ? String(a.sortValue).localeCompare(String(b.sortValue), 'ru', {
                            numeric: true,
                            sensitivity: 'base'
                        })
                        : String(b.sortValue).localeCompare(String(a.sortValue), 'ru', {
                            numeric: true,
                            sensitivity: 'base'
                        });
                });
            }

            return groupArray.flatMap(g => g.rows);
        };

        const applyHierarchicalRowSpansToRange = (rows, start, end) => {
            const activeKeys = [];
            if (filterModes.dealer !== "total") activeKeys.push("dealer_id");
            if (filterModes.server !== "total") activeKeys.push("server_id");
            if (filterModes.service !== "total") activeKeys.push("service_id");
            if (filterModes.apparat !== "total") activeKeys.push("apparat_id");

            for (let i = start; i < end; i++) {
                if (rows[i].isFavSummary) continue;

                activeKeys.forEach((key, dimIdx) => {
                    if (rows[i][`${key}_rowSpan`] === 0) return;

                    let span = 1;
                    for (let j = i + 1; j < end; j++) {
                        if (rows[j].isFavSummary) break;

                        let isMatch = true;
                        for (let k = 0; k <= dimIdx; k++) {
                            const pKey = activeKeys[k];
                            if (rows[i][pKey] !== rows[j][pKey]) {
                                isMatch = false;
                                break;
                            }
                        }

                        if (isMatch) {
                            span++;
                            rows[j][`${key}_rowSpan`] = 0;
                        } else {
                            break;
                        }
                    }
                    rows[i][`${key}_rowSpan`] = span;
                });
            }

            const canGroupVertically = textColumnsCount > 1;
            for (let i = start; i < end; i++) {
                if (rows[i].isFavSummary) {
                    if (canGroupVertically) {
                        if (i === start || !rows[i - 1].isFavSummary) {
                            let summarySpan = 0;
                            for (let j = i; j < end; j++) {
                                if (rows[j].isFavSummary) {
                                    summarySpan++;
                                } else {
                                    break;
                                }
                            }
                            rows[i].favSummaryRowSpan = summarySpan;
                            for (let j = i + 1; j < i + summarySpan; j++) {
                                rows[j].favSummaryRowSpan = 0;
                            }
                            i += summarySpan - 1;
                        }
                    } else {
                        rows[i].favSummaryRowSpan = 1;
                    }
                }
            }
        };

        const flatFavs = sortGroupedRows(favRows);
        const flatOrdinary = sortGroupedRows(ordinaryRows);

        // Расчет агрегатов для избранных
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
            all: {count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0},
            success: {count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0},
            fail: {count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0}
        });

        const favSummaryRows = [];
        if (!paymentsStatus) {
            favSummaryRows.push(
                { key: "fav-summary-row-success", isFavSummary: true, favSummaryType: "success", ...favSummary.success },
                { key: "fav-summary-row-fail", isFavSummary: true, favSummaryType: "fail", ...favSummary.fail }
            );
        }
        favSummaryRows.push({
            key: "fav-summary-row-all",
            isFavSummary: true,
            favSummaryType: "all",
            ...favSummary.all
        });

        // ИСПРАВЛЕНО: Проверяем, есть ли обычные платежи помимо избранных.
        // Если обычных строк нет, промежуточный итог для избранных исключается.
        let fullFlatList = [];
        if (favRows.length === 0) {
            fullFlatList = flatOrdinary.map(r => ({ ...r }));
        } else if (ordinaryRows.length === 0) {
            fullFlatList = flatFavs.map(r => ({ ...r }));
        } else {
            fullFlatList = [...flatFavs, ...favSummaryRows, ...flatOrdinary].map(r => ({ ...r }));
        }

        const size = pagination.pageSize;
        for (let chunkStart = 0; chunkStart < fullFlatList.length; chunkStart += size) {
            const chunkEnd = Math.min(chunkStart + size, fullFlatList.length);
            applyHierarchicalRowSpansToRange(fullFlatList, chunkStart, chunkEnd);
        }

        return fullFlatList;
    }, [statistics, sortConfig, paymentsStatus, textColumnsCount, filterModes, pagination.pageSize]);

    const formatCurrency = (value, currency = "KGS") => {
        const num = Number(value || 0);
        return (
            <span className="fw-bold">
                {num.toLocaleString("ru-RU", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                <span className="text-muted small ms-1">{currency}</span>
            </span>
        );
    };

    const renderDimensionCell = (idKey, dictionaryArray) => (text, record) => {
        const cellConfig = {children: null, props: {}};

        if (record.isFavSummary) {
            cellConfig.props.colSpan = 0;
            cellConfig.props.rowSpan = 0;
            return cellConfig;
        }

        const specificRowSpan = record[`${idKey}_rowSpan`];
        if (specificRowSpan !== undefined) {
            cellConfig.props.rowSpan = specificRowSpan;
        }

        const id = record[idKey];
        const foundItem = dictionaryArray?.find((item) => Number(item.id) === Number(id));
        const name = foundItem?.name;

        if (!id || id === "total") {
            cellConfig.children = <Text type="secondary" italic className="small">Сводно</Text>;
        } else if (id === "all") {
            cellConfig.children = <Badge status="processing" text="Все элементы"/>;
        } else {
            cellConfig.children = name ? <span className="small">{id} | {name}</span> :
                <span className="small">{id}</span>;
        }

        return cellConfig;
    };

    const tableColumns = useMemo(() => {
        const cols = [];

        if (filterModes.dealer !== "total") {
            cols.push({
                title: "Дилер",
                dataIndex: "dealer_name",
                key: "dealer_name",
                sorter: true,
                sortOrder: sortConfig.columnKey === "dealer_name" ? sortConfig.order : undefined,
                render: (text, record) => {
                    const id = record.dealer_id;
                    const cellConfig = {children: null, props: {}};

                    if (record.isFavSummary) {
                        return cellConfig;
                    }

                    if (record.dealer_id_rowSpan !== undefined) {
                        cellConfig.props.rowSpan = record.dealer_id_rowSpan;
                    }

                    const dealer = dictionaries?.dealers?.find(
                        (s) => Number(s.id) === Number(id)
                    );

                    const name = dealer?.name;
                    const isFav = FAVORITE_DEALER_IDS.includes(Number(id));

                    if (!id || id === "total") {
                        cellConfig.children = <Text type="secondary" italic className="small">Сводно</Text>;
                    } else if (id === "all") {
                        cellConfig.children = <Badge status="processing" text="Все элементы"/>;
                    } else {
                        cellConfig.children = (
                            <span className="small d-inline-flex align-items-center gap-1">
                                {isFav && <FontAwesomeIcon icon={faStar} className="text-warning me-1"
                                                           title="Избранный дилер"/>}
                                {name ? `${id} | ${name}` : id}
                            </span>
                        );
                    }

                    return cellConfig;
                },
            });
        }

        if (filterModes.server !== "total") {
            cols.push({
                title: "Сервер",
                dataIndex: "server_name",
                key: "server_name",
                sorter: true,
                sortOrder: sortConfig.columnKey === "server_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("server_id", dictionaries?.servers),
            });
        }

        if (filterModes.service !== "total") {
            cols.push({
                title: "Сервис",
                dataIndex: "service_name",
                key: "service_name",
                sorter: true,
                sortOrder: sortConfig.columnKey === "service_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("service_id", dictionaries?.services),
            });
        }

        if (filterModes.apparat !== "total") {
            cols.push({
                title: "Аппарат",
                dataIndex: "apparat_name",
                key: "apparat_name",
                sorter: true,
                sortOrder: sortConfig.columnKey === "apparat_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("apparat_id", dictionaries?.apparats),
            });
        }

        cols.push({
            title: "Статус",
            dataIndex: "payments_status",
            key: "payments_status",
            className: 'text-nowrap',
            render: (val, record) => {
                if (record.isFavSummary) {
                    if (textColumnsCount > 1) {
                        let badgeContent;
                        if (record.favSummaryType === "success") {
                            badgeContent = <Badge status="success" text={<span className="fw-normal">Успешные</span>}/>;
                        } else if (record.favSummaryType === "fail") {
                            badgeContent = <Badge status="error" text={<span className="fw-normal">Ошибка</span>}/>;
                        } else {
                            badgeContent = <Text strong className="text-primary">Всего</Text>;
                        }

                        return {
                            children: badgeContent,
                            props: {colSpan: 1, rowSpan: 1}
                        };
                    }
                    return "";
                }
                if (val === "success") return <Badge status="success" text="Успешные"/>;
                if (val === "fail") return <Badge status="error" text="Ошибка"/>;
                return <span className="text-muted">{val}</span>;
            },
        });

        if (cols.length > 0) {
            const firstColumn = cols[0];
            const originalRender = firstColumn.render;

            firstColumn.render = (text, record, index) => {
                if (record.isFavSummary) {
                    if (textColumnsCount > 1) {
                        if (record.favSummaryRowSpan > 0) {
                            return {
                                children: <Text strong className="text-primary">★ Итоги по избранным</Text>,
                                props: {
                                    rowSpan: record.favSummaryRowSpan,
                                    colSpan: textColumnsCount - 1
                                }
                            };
                        } else {
                            return {
                                props: {rowSpan: 0, colSpan: 0}
                            };
                        }
                    }

                    let content;
                    if (record.favSummaryType === "success") {
                        content = <Badge status="success"
                                         text={<Text strong className="text-success">★ Избранные: Успешные</Text>}/>;
                    } else if (record.favSummaryType === "fail") {
                        content = <Badge status="error"
                                         text={<Text strong className="text-danger">★ Избранные: Ошибочные</Text>}/>;
                    } else {
                        content = <Text strong className="text-primary">★ Всего по избранным</Text>;
                    }
                    return {children: content, props: {rowSpan: 1, colSpan: 1}};
                }
                return originalRender ? originalRender(text, record, index) : text;
            };
        }

        cols.push(
            {
                title: "Кол-во",
                dataIndex: "count",
                className: 'text-nowrap',
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
        );

        return cols;
    }, [sortConfig, filterModes, textColumnsCount, dictionaries]);

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
            return {style: {backgroundColor}};
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
                position: ['rightTop','rightBottom'],
                current: pagination.current,
                pageSize: pagination.pageSize,
                pageSizeOptions: ["100", "200", "300", "500", "1000"],
                showSizeChanger: true,
            }}
            summary={() => {
                const summaryColSpan = textColumnsCount - 1;
                const canGroupSummaryVertically = summaryColSpan > 0;

                const countIdx = canGroupSummaryVertically ? summaryColSpan + 1 : textColumnsCount;
                const totalIdx = countIdx + 1;
                const realPayIdx = countIdx + 2;
                const commIdx = countIdx + 3;
                const rurIdx = countIdx + 4;

                return (
                    <Table.Summary fixed="bottom">
                        {!paymentsStatus && (
                            <Table.Summary.Row style={{backgroundColor: "#f6ffed"}}>
                                {canGroupSummaryVertically ? (
                                    <>
                                        <Table.Summary.Cell index={0} colSpan={summaryColSpan} rowSpan={3}>
                                            <Text strong className="text-primary">💸 Общие итоги таблицы</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={summaryColSpan}>
                                            <Badge status="success" text="Успешные"/>
                                        </Table.Summary.Cell>
                                    </>
                                ) : (
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                        <Badge status="success"
                                               text={<Text strong className="text-success">Итого успешных
                                                   платежей</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                <Table.Summary.Cell index={countIdx} align="right">
                                    <Text strong>{totalSummary.success.count.toLocaleString("ru-RU")} ед.</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={totalIdx}
                                                    align="right">{formatCurrency(totalSummary.success.total)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={realPayIdx}
                                                    align="right">{formatCurrency(totalSummary.success.real_pay)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={commIdx}
                                                    align="right">{formatCurrency(totalSummary.success.commission)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={rurIdx}
                                                    align="right">{formatCurrency(totalSummary.success.real_pay_rur,
                                    <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}

                        {!paymentsStatus && (
                            <Table.Summary.Row style={{backgroundColor: "#fff1f0"}}>
                                {canGroupSummaryVertically ? (
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Badge status="error" text="Ошибка"/>
                                    </Table.Summary.Cell>
                                ) : (
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                        <Badge status="error" text={<Text strong className="text-danger">Итого ошибочных платежей</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                <Table.Summary.Cell index={countIdx} align="right">
                                    <Text strong>{totalSummary.fail.count.toLocaleString("ru-RU")} ед.</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={totalIdx} align="right">{formatCurrency(totalSummary.fail.total)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={realPayIdx} align="right">{formatCurrency(totalSummary.fail.real_pay)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={commIdx} align="right">{formatCurrency(totalSummary.fail.commission)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={rurIdx} align="right">{formatCurrency(totalSummary.fail.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}

                        <Table.Summary.Row style={{backgroundColor: "#e6f7ff", fontWeight: "bold" }}>
                            {canGroupSummaryVertically ? (
                                <>
                                    {paymentsStatus && (
                                        <Table.Summary.Cell index={0} colSpan={summaryColSpan}>
                                            <Text strong className="text-primary">💸 Общие итоги таблицы</Text>
                                        </Table.Summary.Cell>
                                    )}
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Text strong className="text-primary">Всего</Text>
                                    </Table.Summary.Cell>
                                </>
                            ) : (
                                <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                    <Text strong className="text-primary">💸 ОБЩИЙ ИТОГ (Все статусы)</Text>
                                </Table.Summary.Cell>
                            )}
                            <Table.Summary.Cell index={countIdx} align="right">
                                <Text strong>{totalSummary.all.count.toLocaleString("ru-RU")} ед.</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={totalIdx} align="right">{formatCurrency(totalSummary.all.total)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={realPayIdx} align="right">{formatCurrency(totalSummary.all.real_pay)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={commIdx} align="right">{formatCurrency(totalSummary.all.commission)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={rurIdx} align="right">{formatCurrency(totalSummary.all.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
}