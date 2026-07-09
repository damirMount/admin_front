import React, {useMemo, useState} from "react";
import {Badge, Table, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoins, faStar} from "@fortawesome/free-solid-svg-icons";
import SmartTable from "../../../../components/main/table/SmartTable";

const {Text} = Typography;
const FAVORITE_DEALER_IDS = [770, 2643, 2642, 3471, 2579, 3501, 3270, 3067, 3287, 2378, 3287, 2168, 2245];

export default function PaymentsStatisticsTable({
                                                    statistics, loading, totalSummary, filterModes = {}, paymentsStatus,
                                                    dictionaries, apparatType
                                                }) {
    const [sortConfig, setSortConfig] = useState({columnKey: undefined, order: undefined});
    const [pagination, setPagination] = useState({current: 1, pageSize: 50});

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

    // Вспомогательный массив полей для расчетов
    const fieldsToSum = useMemo(() => [
        'count', 'total', 'real_pay', 'real_pay_rur', 'commission', 'reduce', 'comDlr', 'pDlr', 'pFed', 'netWriteOff', 'income'
    ], []);

    // Вычисляем итоги по избранным, только если apparatType == 1
    const favSummary = useMemo(() => {
        const createEmptySummaryObj = () => fieldsToSum.reduce((acc, f) => ({...acc, [f]: 0}), {});
        const summary = {
            all: createEmptySummaryObj(),
            success: createEmptySummaryObj(),
            fail: createEmptySummaryObj()
        };

        statistics.forEach(item => {
            if (Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(item.dealer_id))) {
                const isSuccess = String(item.payments_status || "").toLowerCase().trim() === "success";
                fieldsToSum.forEach(f => {
                    const val = Number(item[f] || 0);
                    summary.all[f] += val;
                    if (isSuccess) summary.success[f] += val;
                    else summary.fail[f] += val;
                });
            }
        });

        return summary;
    }, [statistics, fieldsToSum, apparatType]);

    // Получаем чистые итоги по ОСТАЛЬНЫМ дилерам (Всего из пропсов минус Избранные)
    const ordinarySummary = useMemo(() => {
        const diff = (totalObj, favObj) => {
            return fieldsToSum.reduce((acc, f) => {
                acc[f] = Math.max(0, Number(totalObj?.[f] || 0) - Number(favObj?.[f] || 0));
                return acc;
            }, {});
        };

        return {
            success: diff(totalSummary?.success, favSummary.success),
            fail: diff(totalSummary?.fail, favSummary.fail),
            all: diff(totalSummary?.all, favSummary.all)
        };
    }, [totalSummary, favSummary, fieldsToSum]);

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

        // ШАГ 2: Разделение строк на Избранные и Обычные с проверкой типа аппарата
        const isFavCondition = (id) => Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(id));

        const favRows = aggregatedStatistics.filter(item => isFavCondition(item.dealer_id));
        const ordinaryRows = aggregatedStatistics.filter(item => !isFavCondition(item.dealer_id));

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
                    sortValue = key;
                } else {
                    const {columnKey} = sortConfig;
                    if (fieldsToSum.includes(columnKey)) {
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

            if (sortConfig.columnKey && sortConfig.order) {
                const {columnKey, order} = sortConfig;
                const isAsc = order === "ascend";

                groupArray.sort((a, b) => {
                    if (fieldsToSum.includes(columnKey)) {
                        if (a.sortValue !== b.sortValue) {
                            return isAsc ? a.sortValue - b.sortValue : b.sortValue - a.sortValue;
                        }
                    } else {
                        const comp = String(a.sortValue).localeCompare(String(b.sortValue), 'ru', {
                            numeric: true,
                            sensitivity: 'base'
                        });
                        if (comp !== 0) {
                            return isAsc ? comp : -comp;
                        }
                    }
                    return String(a.fullKey).localeCompare(String(b.fullKey), 'ru', {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            } else {
                groupArray.sort((a, b) => String(a.sortValue).localeCompare(String(b.sortValue), 'ru', {
                    numeric: true,
                    sensitivity: 'base'
                }));
            }

            return groupArray.flatMap(g => g.rows);
        };

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

        const favSummaryRows = [];
        if (!paymentsStatus && favRows.length > 0) {
            favSummaryRows.push(
                {key: "fav-summary-row-success", isFavSummary: true, favSummaryType: "success", ...favSummary.success},
                {key: "fav-summary-row-fail", isFavSummary: true, favSummaryType: "fail", ...favSummary.fail}
            );
        }
        if (favRows.length > 0) {
            favSummaryRows.push({
                key: "fav-summary-row-all",
                isFavSummary: true,
                favSummaryType: "all",
                ...favSummary.all
            });

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
            fullFlatList = flatOrdinary.map(r => ({...r}));
        } else if (ordinaryRows.length === 0) {
            fullFlatList = flatFavs.map(r => ({...r}));
        } else {
            fullFlatList = [...flatFavs, ...favSummaryRows, ...flatOrdinary].map(r => ({...r}));
        }

        const size = pagination.pageSize;
        for (let chunkStart = 0; chunkStart < fullFlatList.length; chunkStart += size) {
            const chunkEnd = Math.min(chunkStart + size, fullFlatList.length);
            applyIndependentRowSpansToRange(fullFlatList, chunkStart, chunkEnd);
        }

        return fullFlatList;
    }, [statistics, sortConfig, paymentsStatus, textColumnsCount, filterModes, pagination.pageSize, favSummary, fieldsToSum, apparatType]);

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

                    const isFav = Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(id));

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

                        return {children: badgeContent, props: {colSpan: 1, rowSpan: 1}};
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
                                children: <Text strong className="text-primary">★ Итоги по нашей сети</Text>,
                                props: {rowSpan: record.favSummaryRowSpan, colSpan: textColumnsCount - 1}
                            };
                        } else {
                            return {props: {rowSpan: 0, colSpan: 0}};
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
                        content = <Text strong className="text-primary">★ Всего по нашей сети</Text>;
                    }
                    return {children: content, props: {rowSpan: 1, colSpan: 1}};
                }
                return originalRender ? originalRender(text, record, index) : text;
            };
        }

        const metricFields = [
            {title: "Кол-во", key: "count", type: "count"},
            {title: "Внесено", key: "total", type: "money"},
            {title: "Проведено", key: "real_pay", type: "money"},
            {title: "Инстр. валюте", key: "real_pay_rur", type: "money", icon: <FontAwesomeIcon icon={faCoins}/>},
            {title: "Списано", key: "reduce", type: "money"},
            {title: "Чист. списание", key: "netWriteOff", type: "money"},
            {title: "Комис. QP", key: "comDlr", type: "money"},
            {title: "Комиссия дил.", key: "commission", type: "money"},
            {title: "Вознаг. дил.", key: "pDlr", type: "money"},
            {title: "Доход дил.", key: "income", type: "money"},
            {title: "Вознаг. QP", key: "pFed", type: "money"},
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
    }, [sortConfig, filterModes, textColumnsCount, dictionaries, apparatType]);

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
            scroll={{x: "max-content"}}
            pagination={{
                position: ['rightTop', 'rightBottom'],
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
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                <Text strong>{Number(summaryData?.count || 0).toLocaleString("ru-RU")} ед.</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.total)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.real_pay)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.real_pay_rur, <FontAwesomeIcon icon={faCoins}/>)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.reduce)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.netWriteOff)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.comDlr)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.commission)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.pDlr)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.income)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={currentIndex++} align="right">
                                {formatCurrency(summaryData?.pFed)}
                            </Table.Summary.Cell>
                        </>
                    );
                };

                return (
                    <Table.Summary fixed="bottom">
                        {/* ПОКАЗЫВАЕМ БЛОК ИТОГОВ ПО АГЕНТАМ ТОЛЬКО ПРИ APPARAT_TYPE === 1 */}
                        {Number(apparatType) === 1 && (
                            <>
                                {/* 1. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (УСПЕШНЫЕ) */}
                                {!paymentsStatus && summaryColSpan > 0 && (
                                    <Table.Summary.Row style={{backgroundColor: "#fcf8e3"}}>
                                        {canGroupSummaryVertically ? (
                                            <>
                                                <Table.Summary.Cell index={0} colSpan={summaryColSpan} rowSpan={3}>
                                                    <Text strong className="text-primary">👥 Итоги по агентам</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={summaryColSpan}>
                                                    <Badge status="success" text="Успешные"/>
                                                </Table.Summary.Cell>
                                            </>
                                        ) : (
                                            <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                                <Badge status="success" text={<Text strong className="text-success">Остальные:
                                                    Успешные</Text>}/>
                                            </Table.Summary.Cell>
                                        )}
                                        {renderMetricCells(ordinarySummary.success, textColumnsCount)}
                                    </Table.Summary.Row>
                                )}

                                {/* 2. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (ОШИБКИ) */}
                                {!paymentsStatus && summaryColSpan > 0 && (
                                    <Table.Summary.Row style={{backgroundColor: "#fcf8e3"}}>
                                        {canGroupSummaryVertically ? (
                                            <Table.Summary.Cell index={summaryColSpan}>
                                                <Badge status="error" text="Ошибка"/>
                                            </Table.Summary.Cell>
                                        ) : (
                                            <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                                <Badge status="error" text={<Text strong className="text-danger">Остальные:
                                                    Ошибки</Text>}/>
                                            </Table.Summary.Cell>
                                        )}
                                        {renderMetricCells(ordinarySummary.fail, textColumnsCount)}
                                    </Table.Summary.Row>
                                )}

                                {/* 3. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (ВСЕГО ПО АГЕНТАМ) */}
                                <Table.Summary.Row style={{backgroundColor: "#fafafa"}}>
                                    {canGroupSummaryVertically ? (
                                        <>
                                            {paymentsStatus && (
                                                <Table.Summary.Cell index={0} colSpan={summaryColSpan}>
                                                    <Text strong className="text-primary">👥 Итоги по агентам</Text>
                                                </Table.Summary.Cell>
                                            )}
                                            <Table.Summary.Cell index={summaryColSpan}>
                                                <Text strong className="text-muted">Всего остальн.</Text>
                                            </Table.Summary.Cell>
                                        </>
                                    ) : (
                                        <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                            <Text strong className="text-muted">👥 ВСЕГО ПО АГЕНТАМ</Text>
                                        </Table.Summary.Cell>
                                    )}
                                    {renderMetricCells(ordinarySummary.all, textColumnsCount)}
                                </Table.Summary.Row>

                                {/* ХОРИЗОНТАЛЬНЫЙ РАЗДЕЛИТЕЛЬ ДЛЯ ЧИТАЕМОСТИ */}
                                <Table.Summary.Row style={{height: '4px', backgroundColor: '#d9d9d9'}}>
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount + 11} style={{padding: 0}}/>
                                </Table.Summary.Row>
                            </>
                        )}

                        {/* 4. ОБЩИЕ ИТОГИ (УСПЕШНЫЕ) */}
                        {!paymentsStatus && summaryColSpan > 0 && (
                            <Table.Summary.Row style={{backgroundColor: "#f6ffed"}}>
                                {canGroupSummaryVertically ? (
                                    <>
                                        <Table.Summary.Cell index={0} colSpan={summaryColSpan} rowSpan={3}>
                                            <Text strong className="text-success">🌍 ОБЩИЕ ИТОГИ</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={summaryColSpan}>
                                            <Badge status="success" text="Успешные"/>
                                        </Table.Summary.Cell>
                                    </>
                                ) : (
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                        <Badge status="success"
                                               text={<Text strong className="text-success">Общие: Успешные</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                {renderMetricCells(totalSummary?.success || {}, textColumnsCount)}
                            </Table.Summary.Row>
                        )}

                        {/* 5. ОБЩИЕ ИТОГИ (ОШИБКИ) */}
                        {!paymentsStatus && summaryColSpan > 0 && (
                            <Table.Summary.Row style={{backgroundColor: "#fff1f0"}}>
                                {canGroupSummaryVertically ? (
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Badge status="error" text="Ошибка"/>
                                    </Table.Summary.Cell>
                                ) : (
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                        <Badge status="error"
                                               text={<Text strong className="text-danger">Общие: Ошибки</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                {renderMetricCells(totalSummary?.fail || {}, textColumnsCount)}
                            </Table.Summary.Row>
                        )}

                        {/* 6. ОБЩИЕ ИТОГИ (ВСЕГО СВОДНО) */}
                        <Table.Summary.Row style={{backgroundColor: "#e6f7ff"}}>
                            {canGroupSummaryVertically ? (
                                <>
                                    {paymentsStatus && (
                                        <Table.Summary.Cell index={0} colSpan={summaryColSpan}>
                                            <Text strong className="text-success">🌍 ОБЩИЕ ИТОГИ</Text>
                                        </Table.Summary.Cell>
                                    )}
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Text strong className="text-primary">Всего общих</Text>
                                    </Table.Summary.Cell>
                                </>
                            ) : (
                                <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                    <Text strong className="text-primary">🌍 ВСЕГО ОБЩИЕ ИТОГИ</Text>
                                </Table.Summary.Cell>
                            )}
                            {renderMetricCells(totalSummary?.all || {}, textColumnsCount)}
                        </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
        />
    );
}