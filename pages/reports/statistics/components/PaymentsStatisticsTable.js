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
        let count = 1; // Колонку "Статус" учитываем всегда
        if (filterModes.dealer !== "total") count++;
        if (filterModes.server !== "total") count++;
        if (filterModes.service !== "total") count++;
        if (filterModes.apparat !== "total") count++;
        return count;
    }, [filterModes]);

    const processedStatistics = useMemo(() => {
        const normalizeId = (id, mode) => {
            if (mode === "total") return "total";
            if (id === undefined || id === null || id === 0 || id === "0" || id === "total" || String(id).trim() === "") {
                return "total";
            }
            return String(id).trim();
        };

        const aggregatedMap = new Map();

        // ШАГ 1: Агрегируем данные
        statistics.forEach(item => {
            const dId = normalizeId(item.dealer_id, filterModes.dealer);
            const srId = normalizeId(item.server_id, filterModes.server);
            const svId = normalizeId(item.service_id, filterModes.service);
            const aId = normalizeId(item.apparat_id, filterModes.apparat);
            const status = String(item.payments_status || "").toLowerCase().trim();

            const groupKey = `d:${dId}_sr:${srId}_sv:${svId}_a:${aId}_st:${status}`;

            if (!aggregatedMap.has(groupKey)) {
                aggregatedMap.set(groupKey, {
                    key: groupKey,
                    dealer_id: dId,
                    parent_id: item.parent_id,
                    server_id: srId,
                    service_id: svId,
                    apparat_id: aId,
                    payments_status: status,
                    count: 0,
                    total: 0,
                    real_pay: 0,
                    real_pay_rur: 0,
                    commission: 0,
                    reduce: 0,
                    comDlr: 0,
                    pDlr: 0,
                    pFed: 0,
                    netWriteOff: 0,
                    income: 0
                });
            }

            const current = aggregatedMap.get(groupKey);
            current.count += Number(item.count || 0);
            current.total += Number(item.total || 0);
            current.real_pay += Number(item.real_pay || 0);
            current.real_pay_rur += Number(item.real_pay_rur || 0);
            current.commission += Number(item.commission || 0);
            current.reduce += Number(item.reduce || 0);
            current.comDlr += Number(item.comDlr || 0);
            current.pDlr += Number(item.pDlr || 0);
            current.pFed += Number(item.pFed || 0);
            current.netWriteOff += Number(item.netWriteOff || 0);
            current.income += Number(item.income || 0);
        });

        let aggregatedStatistics = Array.from(aggregatedMap.values());

        // ШАГ 2: Разделение строк на Избранные и Обычные
        const favRows = aggregatedStatistics.filter(item => FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));
        const ordinaryRows = aggregatedStatistics.filter(item => !FAVORITE_DEALER_IDS.includes(Number(item.dealer_id)));

        const sortGroupedRows = (rows) => {
            const groups = {};
            rows.forEach(row => {
                const keyParts = [];
                if (filterModes.dealer !== "total") keyParts.push(row.dealer_id);
                if (filterModes.server !== "total") keyParts.push(row.server_id);
                if (filterModes.service !== "total") keyParts.push(row.service_id);
                if (filterModes.apparat !== "total") keyParts.push(row.apparat_id);
                const groupKey = keyParts.join("-") || "total-group";

                if (!groups[groupKey]) groups[groupKey] = [];
                groups[groupKey].push(row);
            });

            const groupArray = Object.keys(groups).map(key => {
                const groupRows = groups[key];
                let sortValue;

                if (!sortConfig.columnKey || !sortConfig.order) {
                    sortValue = key; // Дефолтный ключ для сквозной иерархии
                } else {
                    const {columnKey} = sortConfig;
                    if (["count", "total", "real_pay", "commission", "real_pay_rur", "reduce", "comDlr", "pDlr", "pFed", "netWriteOff", "income"].includes(columnKey)) {
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
                    const statusA = String(a.payments_status || "");
                    const statusB = String(b.payments_status || "");
                    if (statusA === "success" && statusB !== "success") return -1;
                    if (statusA !== "success" && statusB === "success") return 1;
                    return statusA.localeCompare(statusB);
                });

                return {sortValue, fullKey: key, rows: sortedGroupRows};
            });

            // ИСПРАВЛЕНО: Теперь сортировка применяется ВСЕГДА (дефолтная строит правильную структуру смежности)
            if (sortConfig.columnKey && sortConfig.order) {
                const {columnKey, order} = sortConfig;
                const isAsc = order === "ascend";

                groupArray.sort((a, b) => {
                    if (["count", "total", "real_pay", "commission", "real_pay_rur", "reduce", "comDlr", "pDlr", "pFed", "netWriteOff", "income"].includes(columnKey)) {
                        if (a.sortValue !== b.sortValue) {
                            return isAsc ? a.sortValue - b.sortValue : b.sortValue - a.sortValue;
                        }
                    } else {
                        const comp = String(a.sortValue).localeCompare(String(b.sortValue), 'ru', { numeric: true, sensitivity: 'base' });
                        if (comp !== 0) {
                            return isAsc ? comp : -comp;
                        }
                    }
                    // Стабильный fallback по полному ключу, чтобы под-колонки не рассыпались при совпадении главных критериев
                    return String(a.fullKey).localeCompare(String(b.fullKey), 'ru', { numeric: true, sensitivity: 'base' });
                });
            } else {
                // Сортировка по умолчанию: выстраивает цепочку Дилер-Сервер-Сервис-Аппарат
                groupArray.sort((a, b) => String(a.sortValue).localeCompare(String(b.sortValue), 'ru', { numeric: true, sensitivity: 'base' }));
            }

            return groupArray.flatMap(g => g.rows);
        };

        // ИСПРАВЛЕНО: Расчет rowSpan сделан независимым для каждого из 4 столбцов
        const applyIndependentRowSpansToRange = (rows, start, end) => {
            const activeKeys = [];
            if (filterModes.dealer !== "total") activeKeys.push("dealer_id");
            if (filterModes.server !== "total") activeKeys.push("server_id");
            if (filterModes.service !== "total") activeKeys.push("service_id");
            if (filterModes.apparat !== "total") activeKeys.push("apparat_id");

            for (let i = start; i < end; i++) {
                activeKeys.forEach(key => {
                    rows[i][`${key}_rowSpan`] = 1;
                });
            }

            activeKeys.forEach(key => {
                for (let i = start; i < end; i++) {
                    if (rows[i].isFavSummary) continue;
                    if (rows[i][`${key}_rowSpan`] === 0) continue;

                    let span = 1;
                    for (let j = i + 1; j < end; j++) {
                        if (rows[j].isFavSummary) break;

                        // Если значение в этом конкретном столбце совпадает — увеличиваем span
                        if (String(rows[i][key]) === String(rows[j][key])) {
                            span++;
                            rows[j][`${key}_rowSpan`] = 0;
                        } else {
                            break;
                        }
                    }
                    rows[i][`${key}_rowSpan`] = span;
                }
            });
        };

        const flatFavs = sortGroupedRows(favRows);
        const flatOrdinary = sortGroupedRows(ordinaryRows);

        const getRowMetricValue = (row, field) => {
            let sum = Number(row[field] || 0);
            if (row.children) {
                row.children.forEach(c => { sum += Number(c[field] || 0); });
            }
            return sum;
        };

        const fieldsToSum = ['count', 'total', 'real_pay', 'real_pay_rur', 'commission', 'reduce', 'comDlr', 'pDlr', 'pFed', 'netWriteOff', 'income'];
        const createEmptySummaryObj = () => fieldsToSum.reduce((acc, f) => ({ ...acc, [f]: 0 }), {});

        const favSummary = favRows.reduce((acc, curr) => {
            const isSuccess = String(curr.payments_status || "") === "success";

            fieldsToSum.forEach(f => {
                const val = getRowMetricValue(curr, f);
                acc.all[f] += val;
                if (isSuccess) {
                    acc.success[f] += val;
                } else {
                    acc.fail[f] += val;
                }
            });
            return acc;
        }, {
            all: createEmptySummaryObj(),
            success: createEmptySummaryObj(),
            fail: createEmptySummaryObj()
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

        if (favSummaryRows.length > 0) {
            if (textColumnsCount > 1) {
                favSummaryRows[0].favSummaryRowSpan = favSummaryRows.length;
                for (let i = 1; i < favSummaryRows.length; i++) {
                    favSummaryRows[i].favSummaryRowSpan = 0;
                }
            } else {
                favSummaryRows.forEach(row => {
                    row.favSummaryRowSpan = 1;
                });
            }
        }

        let fullFlatList;
        if (favRows.length === 0) {
            fullFlatList = flatOrdinary.map(r => ({ ...r }));
        } else if (ordinaryRows.length === 0) {
            fullFlatList = flatFavs.map(r => ({ ...r }));
        } else {
            fullFlatList = [...flatFavs, ...favSummaryRows, ...flatOrdinary].map(r => ({ ...r }));
        }

        // Постраничный расчет rowSpan (чтобы разметка не съезжала на переключениях пагинации)
        const size = pagination.pageSize;
        for (let chunkStart = 0; chunkStart < fullFlatList.length; chunkStart += size) {
            const chunkEnd = Math.min(chunkStart + size, fullFlatList.length);
            applyIndependentRowSpansToRange(fullFlatList, chunkStart, chunkEnd);
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

                    if (record.isFavSummary) return cellConfig;

                    const specificRowSpan = record[`dealer_id_rowSpan`];
                    if (specificRowSpan !== undefined) {
                        cellConfig.props.rowSpan = specificRowSpan;
                    }

                    const dealer = dictionaries?.dealers?.find((s) => Number(s.id) === Number(id));
                    const name = dealer?.name;
                    const isFav = FAVORITE_DEALER_IDS.includes(Number(id));

                    if (!id || id === "total") {
                        cellConfig.children = <Text type="secondary" italic className="small">Сводно</Text>;
                    } else if (id === "all") {
                        cellConfig.children = <Badge status="processing" text="Все элементы"/>;
                    } else {
                        cellConfig.children = (
                            <span className="small d-inline-flex align-items-center gap-1">
                                {isFav && <FontAwesomeIcon icon={faStar} className="text-warning me-1"/>}
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

                        return { children: badgeContent, props: {colSpan: 1, rowSpan: 1} };
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
                                props: { rowSpan: record.favSummaryRowSpan, colSpan: textColumnsCount - 1 }
                            };
                        } else {
                            return { props: {rowSpan: 0, colSpan: 0} };
                        }
                    }

                    let content;
                    if (record.favSummaryType === "success") {
                        content = <Badge status="success" text={<Text strong className="text-success">★ Избранные: Успешные</Text>}/>;
                    } else if (record.favSummaryType === "fail") {
                        content = <Badge status="error" text={<Text strong className="text-danger">★ Избранные: Ошибочные</Text>}/>;
                    } else {
                        content = <Text strong className="text-primary">★ Всего по избранным</Text>;
                    }
                    return {children: content, props: {rowSpan: 1, colSpan: 1}};
                }
                return originalRender ? originalRender(text, record, index) : text;
            };
        }

        // Числовые колонки
        const metricFields = [
            { title: "Кол-во", key: "count", type: "count" },
            { title: "Внесено", key: "total", type: "money" },
            { title: "Проведено", key: "real_pay", type: "money" },
            { title: "Инстр. валюте", key: "real_pay_rur", type: "money", icon: <FontAwesomeIcon icon={faCoins}/> },
            { title: "Списано", key: "reduce", type: "money" },
            { title: "Чист. списание", key: "netWriteOff", type: "money" },
            { title: "Комис. QP", key: "comDlr", type: "money" },
            { title: "Комиссия дил.", key: "commission", type: "money" },
            { title: "Вознаг. дил.", key: "pDlr", type: "money" },
            { title: "Доход дил.", key: "income", type: "money" },
            { title: "Вознаг. QP", key: "pFed", type: "money" },
        ];

        metricFields.forEach(field => {
            cols.push({
                title: field.title,
                dataIndex: field.key,
                key: field.key,
                align: "right",
                className: 'text-nowrap',
                sorter: true,
                sortOrder: sortConfig.columnKey === field.key ? sortConfig.order : undefined,
                render: (val) => field.type === "count"
                    ? <span className="text-muted">{Number(val || 0).toLocaleString("ru-RU")} ед.</span>
                    : formatCurrency(val, field.icon || "KGS")
            });
        });

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
            scroll={{ x: "max-content" }}
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
                const renderMetricCells = (summaryData, startIndex) => {
                    let currentIndex = startIndex;
                    return (
                        <>
                            <Table.Summary.Cell index={currentIndex++} align="right"><Text strong>{Number(summaryData.count || 0).toLocaleString("ru-RU")} ед.</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.total)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.real_pay)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.reduce)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.netWriteOff)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.comDlr)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.commission)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.pDlr)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.income)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">{formatCurrency(summaryData.pFed)}</Table.Summary.Cell>
                        </>
                    );
                };

                return (
                    <Table.Summary fixed="bottom">
                        {!paymentsStatus && summaryColSpan > 0 && (
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
                                        <Badge status="success" text={<Text strong className="text-success">Итого успешных платежей</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                {renderMetricCells(totalSummary.success, textColumnsCount)}
                            </Table.Summary.Row>
                        )}

                        {!paymentsStatus && summaryColSpan > 0 && (
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
                                {renderMetricCells(totalSummary.fail, textColumnsCount)}
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
                                    <Text strong className="text-primary">💸 ИТОГО</Text>
                                </Table.Summary.Cell>
                            )}
                            {renderMetricCells(totalSummary.all, textColumnsCount)}
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
}