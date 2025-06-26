import React, {useState} from "react";
import {Descriptions, Divider, Empty, Result, Table, Typography} from "antd";
import {MoneyFormatNumber} from "../../main/system/MoneyFormatNumber";

const {Title, Paragraph, Text} = Typography;

const ApparatLogsCard = ({logsResult = [], servicesOptionRaw = [] }) => {
    const PaymentsCard = () => {
        const [paginations, setPaginations] = useState({}); // { [transactionId]: { current, pageSize } }

        const handlePaginationChange = (transactionId, pagination) => {
            setPaginations(prev => ({
                ...prev,
                [transactionId]: pagination,
            }));
        };

        const tableColumns = [
            {
                title: '№',
                dataIndex: 'index',
                key: 'index',
                width: 50,
                align: 'center',
                render: (_, record, index) => {
                    const transactionId = record.transactionId;
                    const pag = paginations[transactionId] || {current: 1, pageSize: 20};
                    return (pag.current - 1) * pag.pageSize + index + 1;
                }
            },
            {title: 'Дата', dataIndex: 'date'},
            {title: 'Номинал', dataIndex: 'nominal'},
            {title: 'Валюта', dataIndex: 'currency'},
            {
                title: 'Тип',
                dataIndex: 'formFactor',
                render: (text) => {
                    if (text === 'BILL') return 'Купюра';
                    if (text === 'COIN') return 'Монета';
                    return text;
                }
            },
            {title: 'pid', dataIndex: 'pid'},
        ];

        const paymentCards = logsResult.payments?.map((payment) => {
            const transactionId = payment.transactionId;

            const pagination = paginations[transactionId] || {
                current: 1,
                pageSize: 20
            };
            const selectedService = servicesOptionRaw.find(
                (s) => String(s.id) === String(payment?.service)
            );
            const serviceName = selectedService ? `${selectedService.name} (${selectedService.id})` : (payment.service || 'Неизвестно')

            const paymentSum = (payment.sum || payment.sum === 0) ? payment.sum : 0
            const mainDesc = [
                {label: 'Реквизит', children: payment.persacc || 'Неизвестно'},
                {label: 'Сумма', children: `${MoneyFormatNumber(paymentSum, 'full')} сом`,},
                {label: 'Номер транзакции', children: payment.transactionId || 'Неизвестно'},
                {label: 'Дата платежка', children: payment.time || 'Неизвестно'},
                {label: 'Сервис', children: serviceName},
            ];


            const variablesList = [];
            if (payment.variables) {
                for (const [key, value] of Object.entries(payment.variables)) {
                    variablesList.push({label: key, children: value || 'Пусто'});
                }
            }

            const {
                coinsCount,
                moneyCount1,
                moneyCount2,
                totalCount,
                totalSum
            } = parseCashUnits(payment.cashUnits);

            const dataWithKeys = payment.cashUnits
                .filter(unit => Number(unit.nominal) !== 0)
                .map((unit, index) => ({
                    ...unit,
                    key: `${transactionId}-${index}`,
                    transactionId, // для рендера индекса
                }));

            return (
                <div key={`transaction-${transactionId}`} className="d-flex flex-row justify-content-start mt-3">
                    {/*Основные данные*/}
                    <div className="card card-body w-50 d-flex flex-column justify-content-start">
                        <Descriptions
                            layout="vertical" size="small"
                            column={2}
                            title={`Транзакция №${transactionId}`}
                            items={mainDesc}
                        />
                        <Divider className="border-secondary" dashed={true}>Доп. данные</Divider>
                        {variablesList.length > 0 ? (
                            <Descriptions layout="vertical" size="small" column={2} items={variablesList}/>
                        ) : (
                            <div className='d-flex align-items-center h-100'>
                                <Result
                                    icon={<Empty description={false}/>}
                                    title="Данные отсутствуют"
                                    subTitle="Извините, но мы не смогли ничего найти по вашему запросу."
                                />
                            </div>
                        )}
                    </div>

                    {/*Купюры*/}
                    <div className="d-flex card card-body w-75 justify-content-start ms-3">
                        <div className='d-flex align-items-end'>
                            <Descriptions layout="horizontal" size="small" column={1} title="Купюры"
                                          items={coinsCount}/>
                            <Descriptions layout="horizontal" size="small" column={1} items={moneyCount1}/>
                            <Descriptions layout="horizontal" size="small" column={1} items={moneyCount2}/>
                        </div>

                        <div className='d-flex flex-row align-items-center justify-content-between mt-4'>
                            <Title className='fw-medium' level={4}>Всего: {totalCount} шт.</Title>
                            <Title className='mt-0' level={4}>Сумма: {MoneyFormatNumber(totalSum, 'full')} сом</Title>
                        </div>

                        <Divider className="border-secondary" dashed={true}>Вложенные купюры</Divider>

                        {dataWithKeys.length > 0 ? (
                            <Table
                                columns={tableColumns}
                                size='small'
                                bordered={true}
                                pagination={{
                                    ...pagination,
                                    onChange: (current, pageSize) =>
                                        handlePaginationChange(transactionId, {current, pageSize})
                                }}
                                dataSource={dataWithKeys}
                            />
                        ) : (
                            <div className='d-flex align-items-center h-100'>
                                <Result
                                    icon={<Empty description={false}/>}
                                    title="Данные отсутствуют"
                                    subTitle="Извините, но мы не смогли ничего найти по вашему запросу."
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        });

        function parseCashUnits(cashUnits) {
            const coinDenominations = ['1', '3', '5', '10'];
            const moneyDenominations1 = ['20', '50', '100', '200'];
            const moneyDenominations2 = ['500', '1000', '2000', '5000'];

            const counts = {};
            let totalCount = 0;
            let totalSum = 0;

            for (const unit of cashUnits) {
                const nominal = unit.nominal;
                if (Number(nominal) === 0) continue;
                if (!counts[nominal]) counts[nominal] = 0;
                counts[nominal]++;
                totalCount++;
                totalSum += Number(nominal);
            }

            const buildGroup = (denoms) => denoms.map(n => ({
                label: `${n} сом`,
                children: counts[n] ? `${counts[n]} шт.` : ''
            }));

            return {
                coinsCount: buildGroup(coinDenominations),
                moneyCount1: buildGroup(moneyDenominations1),
                moneyCount2: buildGroup(moneyDenominations2),
                totalCount,
                totalSum
            };
        }

        return <>{paymentCards}</>;
    };


    return (
        <>
            {logsResult.payments?.length > 0 && (
                <>
                    <Divider className="mt-5 mb-3 border-secondary" dashed={true}>
                        <Title level={3}>Найденные платежи</Title>
                    </Divider>

                    <PaymentsCard/>
                </>
            )}
        </>
    );
};

export default ApparatLogsCard;
