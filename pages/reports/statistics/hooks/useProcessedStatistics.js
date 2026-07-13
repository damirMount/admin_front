import { useMemo } from "react";
import { FAVORITE_DEALER_IDS, FIELDS_TO_SUM } from "../components/utils";

function useProcessedStatistics({
                                    statistics,
                                    totalSummary,
                                    filterModes,
                                    paymentsStatus,
                                    pagination,
                                    apparatType,
                                    sortConfig,
                                    dictionaries
                                }) {

    const nameMaps = useMemo(() => ({
        dealer_name: new Map(dictionaries?.dealers?.map(d => [String(d.id), d.name]) || []),
        server_name: new Map(dictionaries?.servers?.map(d => [String(d.id), d.name]) || []),
        service_name: new Map(dictionaries?.services?.map(d => [String(d.id), d.name]) || []),
        apparat_name: new Map(dictionaries?.apparats?.map(d => [String(d.id), d.name]) || []),
    }), [dictionaries]);

    const favSummary = useMemo(() => {
        const createEmptySummaryObj = () => {
            const obj = FIELDS_TO_SUM.reduce((acc, f) => ({ ...acc, [f]: 0 }), {});
            obj.total_income = 0; // Инициализация
            return obj;
        };
        const summary = { all: createEmptySummaryObj(), success: createEmptySummaryObj(), fail: createEmptySummaryObj() };

        statistics.forEach(item => {
            if (Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(item.dealer_id))) {
                const isSuccess = String(item.payments_status || "").toLowerCase().trim() === "success";

                // Для нашей сети: Комиссия Дил + Вознаграждение Дил + Вознаграждение QP
                const inc = (Number(item.commission) || 0) + (Number(item.pDlr) || 0) + (Number(item.pFed) || 0);

                FIELDS_TO_SUM.forEach(f => {
                    const val = Number(item[f] || 0);
                    summary.all[f] += val;
                    if (isSuccess) summary.success[f] += val;
                    else summary.fail[f] += val;
                });

                // Добавление расчета для Дохода
                summary.all.total_income += inc;
                if (isSuccess) summary.success.total_income += inc;
                else summary.fail.total_income += inc;
            }
        });
        return summary;
    }, [statistics, apparatType]);

    const ordinarySummary = useMemo(() => {
        const diff = (totalObj, favObj) => {
            const result = FIELDS_TO_SUM.reduce((acc, f) => {
                acc[f] = Math.max(0, Number(totalObj?.[f] || 0) - Number(favObj?.[f] || 0));
                return acc;
            }, {});
            // Разница для Дохода
            result.total_income = Math.max(0, Number(totalObj?.total_income || 0) - Number(favObj?.total_income || 0));
            return result;
        };
        return {
            success: diff(totalSummary?.success, favSummary.success),
            fail: diff(totalSummary?.fail, favSummary.fail),
            all: diff(totalSummary?.all, favSummary.all)
        };
    }, [totalSummary, favSummary]);

    const processedStatistics = useMemo(() => {
        const normalizeId = (id) => (id === undefined || id === null || id === 0 || id === "0" || id === "total" || String(id).trim() === "") ? "total" : String(id).trim();

        const aggregatedMap = new Map();
        statistics.forEach(item => {
            const keys = {
                d: normalizeId(item.dealer_id),
                sr: normalizeId(item.server_id),
                sv: normalizeId(item.service_id),
                a: normalizeId(item.apparat_id),
                st: String(item.payments_status || "").toLowerCase().trim()
            };
            const groupKey = `d:${keys.d}_sr:${keys.sr}_sv:${keys.sv}_a:${keys.a}_st:${keys.st}`;

            // Логика расчета 'Доход' в зависимости от сети
            const isOurNetwork = Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(item.dealer_id));
            const calculatedIncome = isOurNetwork
                ? ((Number(item.commission) || 0) + (Number(item.pDlr) || 0) + (Number(item.pFed) || 0))
                : ((Number(item.comDlr) || 0) + (Number(item.pFed) || 0));

            if (!aggregatedMap.has(groupKey)) {
                aggregatedMap.set(groupKey, {
                    ...keys, dealer_id: keys.d, server_id: keys.sr, service_id: keys.sv, apparat_id: keys.a, payments_status: keys.st,
                    count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0, reduce: 0, comDlr: 0, pDlr: 0, pFed: 0, netWriteOff: 0, income: 0,
                    total_income: 0 // Инициализация
                });
            }
            const current = aggregatedMap.get(groupKey);
            FIELDS_TO_SUM.forEach(f => current[f] += Number(item[f] || 0));
            current.total_income += calculatedIncome; // Прибавляем вычисленный доход
        });

        const allRows = Array.from(aggregatedMap.values());
        const isFavCondition = (id) => Number(apparatType) === 1 && FAVORITE_DEALER_IDS.includes(Number(id));

        const favRows = allRows.filter(i => isFavCondition(i.dealer_id));
        const ordinaryRows = allRows.filter(i => !isFavCondition(i.dealer_id));

        const sortAndGroup = (rows) => {
            const groupsMap = new Map();
            rows.forEach(row => {
                const keyParts = [];
                if (filterModes.dealer !== "total") keyParts.push(row.dealer_id);
                if (filterModes.server !== "total") keyParts.push(row.server_id);
                if (filterModes.service !== "total") keyParts.push(row.service_id);
                if (filterModes.apparat !== "total") keyParts.push(row.apparat_id);
                const groupKey = keyParts.join("-") || "total-group";

                if (!groupsMap.has(groupKey)) {
                    const summaryObj = FIELDS_TO_SUM.reduce((acc, f) => ({ ...acc, [f]: 0 }), {});
                    summaryObj.total_income = 0; // Инициализация
                    groupsMap.set(groupKey, { rows: [], summary: summaryObj });
                }
                const group = groupsMap.get(groupKey);
                group.rows.push(row);
                FIELDS_TO_SUM.forEach(f => group.summary[f] += Number(row[f] || 0));
                group.summary.total_income += Number(row.total_income || 0); // Добавляем доход в Summary
            });

            let groupsArray = Array.from(groupsMap.values());

            if (sortConfig?.columnKey && sortConfig?.order) {
                const { columnKey, order } = sortConfig;
                const mul = order === "ascend" ? 1 : -1;

                groupsArray.sort((a, b) => {
                    // Поддержка сортировки для добавленной колонки total_income
                    if (FIELDS_TO_SUM.includes(columnKey) || columnKey === "total_income") {
                        return (a.summary[columnKey] - b.summary[columnKey]) * mul;
                    }

                    if (columnKey.includes("_name")) {
                        const idKey = columnKey.replace("_name", "_id");
                        const map = nameMaps[columnKey];
                        const valA = map?.get(String(a.rows[0][idKey])) || "";
                        const valB = map?.get(String(b.rows[0][idKey])) || "";
                        return valA.localeCompare(valB) * mul;
                    }

                    const valA = String(a.rows[0][columnKey] || "");
                    const valB = String(b.rows[0][columnKey] || "");
                    return valA.localeCompare(valB) * mul;
                });
            }

            return groupsArray.flatMap(g => g.rows.sort((a, b) => {
                const statusA = String(a.payments_status || "");
                const statusB = String(b.payments_status || "");
                if (statusA === "success" && statusB !== "success") return -1;
                if (statusA !== "success" && statusB === "success") return 1;
                return statusA.localeCompare(statusB);
            }));
        };

        const flatFavs = sortAndGroup(favRows);
        const flatOrdinary = sortAndGroup(ordinaryRows);

        const favSummaryRows = [];
        if (!paymentsStatus && favRows.length > 0) {
            favSummaryRows.push(
                { key: "fav-summary-row-success", isFavSummary: true, favSummaryType: "success", ...favSummary.success },
                { key: "fav-summary-row-fail", isFavSummary: true, favSummaryType: "fail", ...favSummary.fail }
            );
        }
        if (favRows.length > 0) {
            favSummaryRows.push({ key: "fav-summary-row-all", isFavSummary: true, favSummaryType: "all", ...favSummary.all });
        }

        const textColumnsCount = 1 + (filterModes.dealer !== "total") + (filterModes.server !== "total") + (filterModes.service !== "total") + (filterModes.apparat !== "total");
        if (favRows.length > 0 && favSummaryRows.length > 0) {
            if (textColumnsCount > 1) {
                favSummaryRows[0].favSummaryRowSpan = favSummaryRows.length;
                for (let i = 1; i < favSummaryRows.length; i++) favSummaryRows[i].favSummaryRowSpan = 0;
            } else {
                favSummaryRows.forEach(row => { row.favSummaryRowSpan = 1; });
            }
        }

        const fullFlatList = [...flatFavs, ...favSummaryRows, ...flatOrdinary];

        const applyRowSpans = (rows, start, end) => {
            const activeKeys = [];
            if (filterModes.dealer !== "total") activeKeys.push("dealer_id");
            if (filterModes.server !== "total") activeKeys.push("server_id");
            if (filterModes.service !== "total") activeKeys.push("service_id");
            if (filterModes.apparat !== "total") activeKeys.push("apparat_id");

            for (let i = start; i < end; i++) {
                activeKeys.forEach(key => { rows[i][`${key}_rowSpan`] = 1; });
            }

            activeKeys.forEach(key => {
                for (let i = start; i < end; i++) {
                    if (rows[i].isFavSummary || rows[i][`${key}_rowSpan`] === 0) continue;
                    let span = 1;
                    for (let j = i + 1; j < end; j++) {
                        if (rows[j].isFavSummary) break;
                        if (String(rows[i][key]) === String(rows[j][key])) {
                            span++;
                            rows[j][`${key}_rowSpan`] = 0;
                        } else break;
                    }
                    rows[i][`${key}_rowSpan`] = span;
                }
            });
        };

        const size = pagination.pageSize;
        for (let chunkStart = 0; chunkStart < fullFlatList.length; chunkStart += size) {
            const chunkEnd = Math.min(chunkStart + size, fullFlatList.length);
            applyRowSpans(fullFlatList, chunkStart, chunkEnd);
        }

        return fullFlatList;
    }, [statistics, filterModes, paymentsStatus, pagination.pageSize, favSummary, apparatType, sortConfig, nameMaps]);

    return { processedStatistics, ordinarySummary };
}

export default useProcessedStatistics;
