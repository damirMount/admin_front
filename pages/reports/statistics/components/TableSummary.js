import React from "react";
import { Table, Typography, Badge } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import formatCurrency, { FAVORITE_DEALER_IDS } from "./utils";

const { Text } = Typography;

export default function TableSummary({
                                         apparatType,
                                         paymentsStatus,
                                         textColumnsCount,
                                         ordinarySummary,
                                         totalSummary,
                                         filterModes,
                                         processedStatistics = []
                                     }) {

    const isTerminalMode = Number(apparatType) === 1;
    const isAgentSummaryVisible = filterModes?.dealer !== 'total';
    const summaryColSpan = textColumnsCount - 1;
    const canGroupSummaryVertically = summaryColSpan > 0;

    // Функция проверки: является ли строка реальной записью дилера (а не итоговой строкой)
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

    // Отбираем ТОЛЬКО чистые данные дилеров (без промежуточных и итоговых строк)
    const pureRows = processedStatistics.filter(isRealDataRow);

    // Универсальная функция суммирования дохода по отфильтрованным строкам
    const getIncomeSum = (filterFn) => {
        return pureRows
            .filter(filterFn)
            .reduce((sum, r) => sum + (Number(r.total_income) || 0), 0);
    };

    // 1. Доход НАШЕЙ СЕТИ (любимые дилеры)
    const ourNetworkSuccessIncome = getIncomeSum(r => FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)) && r.payments_status === "Успешно");
    const ourNetworkFailIncome = getIncomeSum(r => FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)) && r.payments_status !== "Успешно");
    const ourNetworkAllIncome = getIncomeSum(r => FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)));

    // 2. Доход АГЕНТСКОЙ СЕТИ (остальные дилеры)
    const agencySuccessIncome = getIncomeSum(r => !FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)) && r.payments_status === "Успешно");
    const agencyFailIncome = getIncomeSum(r => !FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)) && r.payments_status !== "Успешно");
    const agencyAllIncome = getIncomeSum(r => !FAVORITE_DEALER_IDS.includes(Number(r.dealer_id)));

    // 3. ОБЩИЙ ДОХОД (Строгая сумма: Наша сеть + Агентская сеть)
    const totalSuccessIncome = ourNetworkSuccessIncome + agencySuccessIncome;
    const totalFailIncome = ourNetworkFailIncome + agencyFailIncome;
    const totalAllIncome = ourNetworkAllIncome + agencyAllIncome;

    const renderMetricCells = (summaryData, startIndex, isTotal = false, calculatedTotalIncome = 0) => {
        let currentIndex = startIndex;
        const getCellClass = (isGreenColumn) => (isTotal && isGreenColumn ? "summary-cell-green" : "");

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
                {/* ПРЯМОЙ ВЫВОД СУММЫ ДОХОДА */}
                <Table.Summary.Cell index={currentIndex++} align="right" className={getCellClass(true)}>
                    {formatCurrency(calculatedTotalIncome)}
                </Table.Summary.Cell>
            </>
        );
    };

    return (
        <>
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
                {/* 1. Блок Итогов по агентам */}
                {isTerminalMode && isAgentSummaryVisible && (
                    <>
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
                                {renderMetricCells(ordinarySummary?.success, textColumnsCount, false, agencySuccessIncome)}
                            </Table.Summary.Row>
                        )}

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
                                {renderMetricCells(ordinarySummary?.fail, textColumnsCount, false, agencyFailIncome)}
                            </Table.Summary.Row>
                        )}

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
                            {renderMetricCells(ordinarySummary?.all, textColumnsCount, true, agencyAllIncome)}
                        </Table.Summary.Row>

                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={textColumnsCount + 12} className="summary-divider-cell" />
                        </Table.Summary.Row>
                    </>
                )}

                {/* 2. Общие итоги */}
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
                        {renderMetricCells(totalSummary?.success, textColumnsCount, false, totalSuccessIncome)}
                    </Table.Summary.Row>
                )}

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
                        {renderMetricCells(totalSummary?.fail, textColumnsCount, false, totalFailIncome)}
                    </Table.Summary.Row>
                )}

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
                    {renderMetricCells(totalSummary?.all, textColumnsCount, false, totalAllIncome)}
                </Table.Summary.Row>
            </Table.Summary>
        </>
    );
}
