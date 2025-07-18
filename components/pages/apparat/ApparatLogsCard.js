import React, {useState} from "react";
import {Descriptions, Divider, Empty, Result, Table, Tooltip, Typography} from "antd";
import {MoneyFormatNumber} from "../../main/system/MoneyFormatNumber";

const {Title, Paragraph, Text} = Typography;

const ApparatLogsCard = ({logsResult = [], servicesOptionRaw = []}) => {
    const PaymentsCard = () => {
        const [paginations, setPaginations] = useState({}); // { [transactionId]: { current, pageSize } }

        const handlePaginationChange = (transactionId, pagination) => {
            setPaginations(prev => ({
                ...prev, [transactionId]: pagination,
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
            {
                title: 'Дата', dataIndex: 'date'
            },
            {
                title: 'Номинал', dataIndex: 'nominal'
            },
            {
                title: 'Валюта',
                dataIndex: 'currency'
            },
            {
                title: 'Тип', dataIndex: 'formFactor', render: (text) => {
                    if (text === 'BILL') return 'Купюра';
                    if (text === 'COIN') return 'Монета';
                    return text;
                }
            },
            {
                title: 'pid', dataIndex: 'pid'
            },
        ];

        const paymentCards = logsResult.payments?.map((payment, key) => {
            const transactionId = payment.transactionId;

            const pagination = paginations[transactionId] || {
                current: 1, pageSize: 30
            };
            const selectedService = servicesOptionRaw.find((s) => String(s.id) === String(payment?.service));
            const serviceName = selectedService ? `${selectedService.name} (${selectedService.id})` : (payment.service || 'Неизвестно')

            const paymentSum = (payment.sum || payment.sum === 0) ? payment.sum : 0
            const mainDesc = [
                {
                    label: 'Реквизит',
                    children: payment.persacc || 'Неизвестно'
                },
                {
                    label: 'Сумма',
                    children: `${MoneyFormatNumber(paymentSum, 'full')} сом`,
                },
                {
                    label: 'Номер транзакции',
                    children: payment.transactionId || 'Неизвестно'
                },
                {
                    label: 'Дата платежа',
                    children: payment.time || 'Неизвестно'
                },
                {
                    label: 'Сервис',
                    children: serviceName
                },
            ];

            const variablesMap = {
                DADDR: 'Адрес дилера',
                DNAME: 'Дилер',
                DINN: 'ИНН дилера',
                DPHONE: 'Номер дилера',
                n_app: 'Номер терминала',
                TADDR: 'Адрес терминала',
                TADDR_woZIP_woSTATE: 'Город ',
                TNAME: 'Терминал',
                TSTATE: 'Регион',
                TSNUM: 'Серийный номер',
                date: 'Дата',
                docname: 'Номер договора',
                fio: 'ФИО',
                lang: 'Язык',
                op: 'Операция',
                oper: 'Сервис',
                sum_nal: 'Комиссия',
                sum_real: 'Сумма к оплате',
                summ: 'Итоговая сумма',
                summ_bills: 'Вложенная сумма',
                tel: 'Мобильный телефон',
                persacc: 'Реквизит',
                pers_acc: 'Реквизит 2',
                number: 'Номер чека',
                limit: 'Лимит к оплате'
            };

            const dealerMainKeys = ['DNAME', 'DADDR'];
            const dealerSubKeys = ['DINN', 'docname', 'DPHONE'];
            const terminalMainKeys = ['TNAME', 'TADDR'];
            const terminalSubKeys = ['TADDR_woZIP_woSTATE', 'TSTATE', 'n_app', 'TSNUM'];
            const serviceNameKeys = ['oper'];
            const receiptKeys = ['date', 'number'];
            const serviceKeys = ['persacc', 'pers_acc', 'fio', 'limit', 'tel'];
            const paymentKeys = ['sum_nal', 'summ_bills', 'sum_real', 'summ'];

            const dealerMainData = [];
            const dealerSubData = [];
            const terminalMainData = [];
            const terminalSubData = [];
            const serviceNameData = [];
            const receiptData = [];
            const serviceData = [];
            const paymentData = [];
            const unknownData = [];

// Множество для отслеживания уже добавленных ключей
            const usedKeys = new Set();

            if (payment.variables) {
                const addEntries = (keys, target) => {
                    keys.forEach((key) => {
                        if (key in payment.variables && !usedKeys.has(key)) {
                            target.push({
                                label: <Tooltip title={key}>{variablesMap[key] || key}</Tooltip>,
                                children: payment.variables[key] || 'Пусто',
                            });
                            usedKeys.add(key);
                        }
                    });
                };

                addEntries(dealerMainKeys, dealerMainData);
                addEntries(dealerSubKeys, dealerSubData);
                addEntries(terminalMainKeys, terminalMainData);
                addEntries(terminalSubKeys, terminalSubData);
                addEntries(serviceNameKeys, serviceNameData);
                addEntries(receiptKeys, receiptData);
                addEntries(serviceKeys, serviceData);
                addEntries(paymentKeys, paymentData);

                // Неизвестные ключи
                for (const key of Object.keys(payment.variables)) {
                    if (!usedKeys.has(key)) {
                        unknownData.push({
                            label: <Tooltip title={key}>{variablesMap[key] || key}</Tooltip>,
                            children: payment.variables[key] || 'Пусто',
                        });
                        usedKeys.add(key);
                    }
                }
            }


            const {
                coinsCount, moneyCount1, moneyCount2, totalCount, totalSum
            } = parseCashUnits(payment.cashUnits);

            const dataWithKeys = payment.cashUnits
                .filter(unit => Number(unit.nominal) !== 0)
                .map((unit, index) => ({
                    ...unit, key: `${transactionId}-${index}`, transactionId, // для рендера индекса
                }));

            return (
                <div key={`transaction-${transactionId}`} className="d-flex flex-row justify-content-start mt-3">
                    {/*Основные данные*/}
                    <div className="card card-body w-50 d-flex flex-column justify-content-start">
                        <Descriptions
                            layout="vertical" size="small"
                            column={2}
                            title={
                                <div className='d-flex justify-content-between w-100 align-items-center'>
                                    <Title level={5}>{`Транзакция №${transactionId}`}</Title>
                                    <Title className='mt-0' level={4}>{`#${key + 1}`}</Title>
                                </div>
                            }
                            items={mainDesc}
                        />
                        <Divider className="border-secondary" dashed={true}>Доп. данные</Divider>
                        {payment.variables ? (<>
                            <Descriptions
                                layout="vertical"
                                size="small"
                                title='Дилер'
                                column={1}
                                items={dealerMainData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small" column={2}
                                items={dealerSubData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                className='mt-3 pt-3 border-top'
                                title='Терминал'
                                column={1}
                                items={terminalMainData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                column={2}
                                items={terminalSubData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                className='mt-3 pt-3 border-top'
                                title='Платёж'
                                column={2}
                                items={serviceNameData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                column={2}
                                items={receiptData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                column={2}
                                items={serviceData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                className='mt-3 pt-3 border-top'
                                title='Доп. данные'
                                column={2}
                                items={unknownData}
                            />
                            <Descriptions
                                layout="vertical"
                                size="small"
                                className='mt-3 pt-3 border-top'
                                title='Оплата'
                                column={2}
                                items={paymentData}
                            />

                        </>) : (<div className='d-flex align-items-center h-100'>
                            <Result
                                icon={<Empty description={false}/>}
                                title="Данные отсутствуют"
                                subTitle="Извините, но мы не смогли ничего найти по вашему запросу."
                            />
                        </div>)}
                    </div>

                    {/*Купюры*/}
                    <div className="d-flex card card-body w-75 justify-content-start ms-3">
                        <Title className='mt-1 mb-4' level={5}>Купюры</Title>
                        <div className='d-flex align-items-end mt-2'>
                            <Descriptions layout="horizontal" size="small" column={1} items={coinsCount}/>
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
                                    onChange: (current, pageSize) => handlePaginationChange(transactionId, {
                                        current,
                                        pageSize
                                    })
                                }}
                                dataSource={dataWithKeys}
                            />) : (<div className='d-flex align-items-center h-100'>
                            <Result
                                icon={<Empty description={false}/>}
                                title="Данные отсутствуют"
                                subTitle="Извините, но мы не смогли ничего найти по вашему запросу."
                            />
                        </div>)}
                    </div>
                </div>);
        });

        function parseCashUnits(cashUnits) {
            const coinDenominations = ['1', '3', '5', '10'];
            const moneyDenominations1 = ['20', '50', '100', '200'];
            const moneyDenominations2 = ['500', '1000', '2000', '5000'];

            const counts = {};
            let totalCount = 0;
            let totalSum = 0;

            if (cashUnits.length > 0) {
                for (const unit of cashUnits) {
                    const nominal = unit.nominal;
                    if (Number(nominal) === 0) continue;
                    if (!counts[nominal]) counts[nominal] = 0;
                    counts[nominal]++;
                    totalCount++;
                    totalSum += Number(nominal);
                }
            }


            const buildGroup = (denoms) => denoms.map(n => ({
                label: `${n} сом`, children: counts[n] ? `${counts[n]} шт.` : ''
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

    return (<>
        {logsResult.payments?.length > 0 && (<>
            <Divider className="mt-5 mb-3 border-secondary" dashed={true}>
                <Title level={3}>Найденные платежи</Title>
            </Divider>

            <PaymentsCard/>
        </>)}
    </>);
};

export default ApparatLogsCard;
