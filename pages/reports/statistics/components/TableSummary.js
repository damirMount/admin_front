import React from "react";
import { Table, Typography, Badge } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "./utils";

const { Text } = Typography;

export default function TableSummary({ apparatType, paymentsStatus, textColumnsCount, ordinarySummary, totalSummary }) {
    const summaryColSpan = textColumnsCount - 1;
    const canGroupSummaryVertically = summaryColSpan > 0;

    const renderMetricCells = (summaryData, startIndex, isTotal = false) => {
        let currentIndex = startIndex;

        // Если это строка "Всего" (isTotal === true), добавляем класс для зеленой подсветки ячеек
        const getCellClass = (isGreenColumn) => {
            return isTotal && isGreenColumn ? "summary-cell-green" : "";
        };

        return (
            <>
                <Table.Summary.Cell index={currentIndex++} align="right">
                    <Text strong>{Number(summaryData?.count || 0).toLocaleString("ru-RU")} ед.</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={currentIndex++} align="right">
                    {formatCurrency(summaryData?.total)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={currentIndex++} align="right" className={getCellClass(true)}>
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
                <Table.Summary.Cell index={currentIndex++} align="right" className={getCellClass(true)}>
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
                <Table.Summary.Cell index={currentIndex++} align="right" className={getCellClass(true)}>
                    {formatCurrency(summaryData?.pFed)}
                </Table.Summary.Cell>
            </>
        );
    };

    return (
        <>
            {/* Локальные стили, которые гарантированно перебьют дефолтный белый фон Ant Design во fixed-подвале */}
            <style>{`
                .summary-row-success-ordinary .ant-table-cell { background: #fcf8e3 !important; }
                .summary-row-fail-ordinary .ant-table-cell { background: #fff1f0 !important; }
                .summary-row-all-ordinary .ant-table-cell { background: #e6f7ff !important; }
                
                .summary-row-success-total .ant-table-cell { background: #f6ffed !important; }
                .summary-row-fail-total .ant-table-cell { background: #fff1f0 !important; }
                .summary-row-all-total .ant-table-cell { background: #e6f7ff !important; }
                
                .ant-table-summary .summary-cell-green { background: #b7eb8f !important; }
                .ant-table-summary .summary-divider-cell { background: #d9d9d9 !important; padding: 0 !important; height: 14px !important; line-height: 0 !important; }
            `}</style>

            <Table.Summary fixed="bottom">
                {Number(apparatType) === 1 && (
                    <>
                        {/* 1. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (УСПЕШНЫЕ) */}
                        {!paymentsStatus && summaryColSpan > 0 && (
                            <Table.Summary.Row className="summary-row-success-ordinary">
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
                                        <Badge status="success" text={<Text strong className="text-success">Остальные: Успешные</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                {renderMetricCells(ordinarySummary.success, textColumnsCount, false)}
                            </Table.Summary.Row>
                        )}

                        {/* 2. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (ОШИБКИ) */}
                        {!paymentsStatus && summaryColSpan > 0 && (
                            <Table.Summary.Row className="summary-row-fail-ordinary">
                                {canGroupSummaryVertically ? (
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Badge status="error" text="Ошибка"/>
                                    </Table.Summary.Cell>
                                ) : (
                                    <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                        <Badge status="error" text={<Text strong className="text-danger">Остальные: Ошибки</Text>}/>
                                    </Table.Summary.Cell>
                                )}
                                {renderMetricCells(ordinarySummary.fail, textColumnsCount, false)}
                            </Table.Summary.Row>
                        )}

                        {/* 3. БЛОК ОСТАЛЬНЫХ ДИЛЕРОВ (ВСЕГО ПО АГЕНТАМ) */}
                        <Table.Summary.Row className="summary-row-all-ordinary">
                            {canGroupSummaryVertically ? (
                                <>
                                    {paymentsStatus && (
                                        <Table.Summary.Cell index={0} colSpan={summaryColSpan}>
                                            <Text strong className="text-primary">👥 Итоги по агентам</Text>
                                        </Table.Summary.Cell>
                                    )}
                                    <Table.Summary.Cell index={summaryColSpan}>
                                        <Text strong className="text-primary">Всего</Text>
                                    </Table.Summary.Cell>
                                </>
                            ) : (
                                <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                    <Text strong className="text-primary">👥 ВСЕГО ПО АГЕНТАМ</Text>
                                </Table.Summary.Cell>
                            )}
                            {/* Здесь оставляем true: эта строка по агентам получит зеленые ячейки как в image_299700.png */}
                            {renderMetricCells(ordinarySummary.all, textColumnsCount, true)}
                        </Table.Summary.Row>

                        {/* Серый разделитель блоков */}
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={textColumnsCount + 11} className="summary-divider-cell" />
                        </Table.Summary.Row>
                    </>
                )}

                {/* 4. ОБЩИЕ ИТОГИ (УСПЕШНЫЕ) */}
                {!paymentsStatus && summaryColSpan > 0 && (
                    <Table.Summary.Row className="summary-row-success-total">
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
                                <Badge status="success" text={<Text strong className="text-success">Общие: Успешные</Text>}/>
                            </Table.Summary.Cell>
                        )}
                        {renderMetricCells(totalSummary?.success || {}, textColumnsCount, false)}
                    </Table.Summary.Row>
                )}

                {/* 5. ОБЩИЕ ИТОГИ (ОШИБКИ) */}
                {!paymentsStatus && summaryColSpan > 0 && (
                    <Table.Summary.Row className="summary-row-fail-total">
                        {canGroupSummaryVertically ? (
                            <Table.Summary.Cell index={summaryColSpan}>
                                <Badge status="error" text="Ошибка"/>
                            </Table.Summary.Cell>
                        ) : (
                            <Table.Summary.Cell index={0} colSpan={textColumnsCount}>
                                <Badge status="error" text={<Text strong className="text-danger">Общие: Ошибки</Text>}/>
                            </Table.Summary.Cell>
                        )}
                        {renderMetricCells(totalSummary?.fail || {}, textColumnsCount, false)}
                    </Table.Summary.Row>
                )}

                {/* 6. ОБЩИЕ ИТОГИ (ВСЕГО СВОДНО) */}
                <Table.Summary.Row className="summary-row-all-total">
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
                    {/* ИСПРАВЛЕНО: передаем false, чтобы строка "Всего общих" была полностью голубой, без зеленых ячеек */}
                    {renderMetricCells(totalSummary?.all || {}, textColumnsCount, false)}
                </Table.Summary.Row>
            </Table.Summary>
        </>
    );
}