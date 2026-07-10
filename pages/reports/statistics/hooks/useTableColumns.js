import React, { useMemo } from "react";
import { Typography, Badge } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faStar } from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { FAVORITE_DEALER_IDS } from "../components/utils";

const { Text } = Typography;

function useTableColumns({ sortConfig, filterModes, textColumnsCount, dictionaries, apparatType }) {

    const renderDimensionCell = (idKey, dictionaryArray) => (text, record) => {
        const cellConfig = { children: null, props: {} };
        if (record.isFavSummary) {
            cellConfig.props.colSpan = 0;
            cellConfig.props.rowSpan = 0;
            return cellConfig;
        }

        const specificRowSpan = record[`${idKey}_rowSpan`];
        if (specificRowSpan !== undefined) cellConfig.props.rowSpan = specificRowSpan;

        const id = record[idKey];
        const foundItem = dictionaryArray?.find((item) => Number(item.id) === Number(id));
        const name = foundItem?.name;

        if (!id || id === "total") {
            cellConfig.children = <Text type="secondary" italic className="small">Сводно</Text>;
        } else if (id === "all") {
            cellConfig.children = <Badge status="processing" text="Все элементы"/>;
        } else {
            cellConfig.children = name ? <span className="small">{id} | {name}</span> : <span className="small">{id}</span>;
        }
        return cellConfig;
    };

    return useMemo(() => {
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
                    const cellConfig = { children: null, props: {} };
                    if (record.isFavSummary) return cellConfig;

                    const specificRowSpan = record[`dealer_id_rowSpan`];
                    if (specificRowSpan !== undefined) cellConfig.props.rowSpan = specificRowSpan;

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
                title: "Сервер", dataIndex: "server_name", key: "server_name", sorter: true,
                sortOrder: sortConfig.columnKey === "server_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("server_id", dictionaries?.servers),
            });
        }

        if (filterModes.service !== "total") {
            cols.push({
                title: "Сервис", dataIndex: "service_name", key: "service_name", sorter: true,
                sortOrder: sortConfig.columnKey === "service_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("service_id", dictionaries?.services),
            });
        }

        if (filterModes.apparat !== "total") {
            cols.push({
                title: "Аппарат", dataIndex: "apparat_name", key: "apparat_name", sorter: true,
                sortOrder: sortConfig.columnKey === "apparat_name" ? sortConfig.order : undefined,
                render: renderDimensionCell("apparat_id", dictionaries?.apparats),
            });
        }

        // Колонка Статус
        cols.push({
            title: "Статус",
            dataIndex: "payments_status",
            key: "payments_status",
            className: 'text-nowrap',
            render: (val, record) => {
                if (record.isFavSummary) {
                    if (textColumnsCount > 1) {
                        let badgeContent = <Text strong className="text-primary">Всего</Text>;
                        if (record.favSummaryType === "success") badgeContent = <Badge status="success" text={<span className="fw-normal">Успешные</span>}/>;
                        if (record.favSummaryType === "fail") badgeContent = <Badge status="error" text={<span className="fw-normal">Ошибка</span>}/>;
                        return { children: badgeContent, props: { colSpan: 1, rowSpan: 1 } };
                    }
                    return "";
                }
                if (val === "success") return <Badge status="success" text="Успешные"/>;
                if (val === "fail") return <Badge status="error" text="Ошибка"/>;
                return <span className="text-muted">{val}</span>;
            },
        });

        // Модификация первой колонки под нужды отображения Избранного
        if (cols.length > 0) {
            const firstColumn = cols[0];
            const originalRender = firstColumn.render;
            firstColumn.render = (text, record, index) => {
                if (record.isFavSummary) {
                    if (textColumnsCount > 1) {
                        if (record.favSummaryRowSpan > 0) {
                            return {
                                children: <Text strong className="text-primary">★ Итоги по нашей сети</Text>,
                                props: { rowSpan: record.favSummaryRowSpan, colSpan: textColumnsCount - 1 }
                            };
                        }
                        return { props: { rowSpan: 0, colSpan: 0 } };
                    }
                    let content = <Text strong className="text-primary">★ Всего по нашей сети</Text>;
                    if (record.favSummaryType === "success") content = <Badge status="success" text={<Text strong className="text-success">★ Избранные: Успешные</Text>}/>;
                    if (record.favSummaryType === "fail") content = <Badge status="error" text={<Text strong className="text-danger">★ Избранные: Ошибочные</Text>}/>;
                    return { children: content, props: { rowSpan: 1, colSpan: 1 } };
                }
                return originalRender ? originalRender(text, record, index) : text;
            };
        }

        // Метрики
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
                title: field.title, dataIndex: field.key, key: field.key, align: "right", className: 'text-nowrap',
                sorter: true, sortOrder: sortConfig.columnKey === field.key ? sortConfig.order : undefined,
                render: (val, record) => {
                    const content = field.type === "count"
                        ? <span className="text-muted">{Number(val || 0).toLocaleString("ru-RU")} ед.</span>
                        : formatCurrency(val, field.icon || "KGS");

                    const targetIncomeKeys = ['real_pay', 'commission', 'pDlr', 'pFed'];
                    if (record?.isFavSummary && record?.favSummaryType === "all" && targetIncomeKeys.includes(field.key)) {
                        return { children: content, props: { style: { background: "#b7eb8f" } } };
                    }
                    return content;
                }
            });
        });

        return cols;
    }, [sortConfig, filterModes, textColumnsCount, dictionaries, apparatType]);
}

export default useTableColumns;