import React, {useMemo} from 'react';
import {Button, Card, Col, Divider, Row, Space, Tag, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCircleExclamation,
    faCoins,
    faLayerGroup,
    faMicrochip,
    faUser,
    faWallet
} from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle, faClock} from "@fortawesome/free-regular-svg-icons";
import md5 from 'md5';

import './PaymentDescription.css';
import {MoneyFormatNumber} from "../../system/MoneyFormatNumber";
import {getPaymentStatusInfo, PAYMENT_ERRORS, RUN_STATUS, TERMINAL_TYPES} from "../PaymentsConstants";
import FormatDate from "../../system/FormatDate";
import CodeBlock from "../../DataDisplay/CodeBlock/CodeBlock";
import {Account2str} from "../../system/Account2str";
import {ANTI_FRAUD_HISTORY_URL} from "../../../../routes/web";

const {Text, Title} = Typography;

const MoneyColumn = ({label, value, color, type = 'full', prefix = 'с'}) => {
    return (
        <Space direction="vertical" className="text-center" size={0}>
            <Text type="secondary" className="label-medium">{label}</Text>
            <Text strong className="money-main" style={{color}}>
                {MoneyFormatNumber(value || 0, type)}
                <small className="ms-1 text-decoration-underline money-prefix">
                    {prefix}
                </small>
            </Text>
        </Space>
    );
};

const PaymentDescriptionCard = ({
                                    record,
                                    servicesList,
                                    dealersList,
                                    apparatsList,
                                    serversList,
                                    showActions = true
                                }) => {
    const info = useMemo(
        () => {
            const findById = (list, id) => {
                return list?.find(
                    (item) => {
                        return item.id === id;
                    }
                ) || {};
            };

            const service = findById(servicesList, Number(record.id_service));
            const dealer = findById(dealersList, Number(record.id_region));
            const server = findById(serversList, Number(record.id_bserver));
            const apparat = findById(apparatsList, Number(record.id_apparat));
            const parentDealer = findById(dealersList, Number(dealer.parentid));

            const rawError = record.additional1;
            const accountInfo = Account2str(record.account);

            // Вызов внешней функции для получения статуса
            const statusInfo = getPaymentStatusInfo(record.payments_run, rawError);

            // Формирование сообщения об ошибке
            const messageCandidate =
                accountInfo?.af_operator_action ||
                accountInfo?.comment ||
                accountInfo?.error ||
                PAYMENT_ERRORS.getError(rawError) ||
                rawError;

            let errorMessage = 'Платёж находится в процессе обработки';

            if (record.payments_run !== RUN_STATUS.SUCCESS) {
                errorMessage = `Код ${rawError}: ${messageCandidate}`;
            } else if (record.payments_run === RUN_STATUS.SUCCESS) {
                errorMessage = 'Платёж успешно проведён';

                // Специфическая логика для сервера 600
                if (server.id === 600) {
                    statusInfo.text += ` ${rawError}`;
                }
            }

            return {
                service,
                dealer,
                server,
                apparat,
                parentDealer,
                errorMessage,
                status: {
                    color: statusInfo.color,
                    text: statusInfo.text,
                    icon: statusInfo.icon,
                    type: statusInfo.type
                },
                serviceName: service.id ? `${service.id} ${service.name}` : `Сервис #${record.id_service}`,
                apparatName: apparat.id ? `${apparat.id} ${apparat.name}` : `Точка #${record.id_apparat}`,
                dealerName: dealer.id ? `${dealer.id} ${dealer.name}` : `Дилер #${record.id_region}`,
                serverName: server.id ? `${server.id} ${server.name}` : `Сервер #${record.id_bserver}`,
                parentDealerName: parentDealer.id ? `${parentDealer.id} ${parentDealer.name}` : `Дилер #${dealer.parentid}`,
            };
        },
        [record, servicesList, dealersList, serversList, apparatsList]
    );

    const finance = useMemo(
        () => {
            const pDlr = record.p_dlr || 0;
            const pFed = record.p_fed || 0;
            const comDlr = record.com_dlr || 0;
            const commission = record.commission || 0;
            const sumReduce = record.sum_reduce || 0;

            return {
                reduce: sumReduce,
                comDlr,
                pDlr,
                pFed,
                commission,
                netWriteOff: sumReduce - comDlr - pDlr - pFed,
                income: pDlr + commission - comDlr
            };
        },
        [record]
    );

    const redisKey = useMemo(
        () => {
            if (!record.identifier) {
                return 'Н/Д';
            }
            const hash = md5(String(record.identifier));
            return `pay:*:{${record.id_service}:${hash}}`;
        },
        [record.id_service, record.identifier]
    );

    return (
        <Card size="small" className="border shadow-sm mb-3 payment-card">
            <div className="p-1">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className='d-flex justify-content-between w-100'>
                        <Space size={16}>
                            <div
                                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center payment-icon-box">
                                <FontAwesomeIcon icon={faMicrochip} size="lg"/>
                            </div>
                            <div>
                                <Text type="secondary" className="label-medium d-block">ID ПЛАТЕЖА</Text>
                                <Title level={4} copyable={{text: String(record.id)}} className="m-0">
                                    #{record.id}
                                </Title>
                            </div>
                        </Space>
                        <div className="text-end">
                            <Text type="secondary" className="label-medium mb-1 d-block">REDIS KEY</Text>
                            <Text level={5} type='secondary' copyable={{text: redisKey}} className="m-0">
                                {redisKey}
                            </Text>
                        </div>
                    </div>
                </div>

                <Row gutter={[12, 12]}>
                    <Col xs={24} md={9}>
                        <div className="p-3 rounded-3 h-100 bg-light border">
                            <div className='d-flex justify-content-between'>
                                <Text type="secondary" className="label-medium" uppercase>
                                    <Space><FontAwesomeIcon icon={faUser}/> Реквизит клиента</Space>
                                </Text>
                                <Text type="secondary" className="label-medium">№ {record.id_trans}</Text>
                            </div>
                            <div className="d-flex mt-2 mb-1 align-items-end justify-content-between w-100">
                                <Text strong className="money-main" copyable>{record.identifier}</Text>
                                <Tag
                                    color={info.status.color}
                                    className="status-tag m-0 d-block"
                                    style={{color: 'white', fontWeight: 'bold'}}
                                >
                                    {info.status.text.toUpperCase()}
                                </Tag>
                            </div>
                            <div className="d-flex mb-3 align-items-center justify-content-between w-100">
                                <Text type="secondary" className="label-medium" copyable={{text: String(record.id)}}>
                                    ID {record.id}
                                </Text>
                                {showActions && info.status.type === 'wait_confirmation' && (
                                    <div>
                                        <Button type="link" href={`${ANTI_FRAUD_HISTORY_URL}/?id=${record.id}`}
                                                target="_blank" className="label-medium p-0">
                                            Проверить платёж
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" className="label-medium" uppercase>Приём</Text>
                                    <Text strong className="money-secondary">{FormatDate(record.time)}</Text>
                                </Space>
                                <Space direction="vertical" size={0} className="text-end">
                                    <Text type="secondary" className="label-medium" uppercase>Проведение</Text>
                                    <Text strong className="money-secondary">
                                        {record.time === record.time_proc ? FormatDate('') : FormatDate(record.time_proc)}
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={15}>
                        <div className="p-3 rounded-3 h-100 bg-light border">
                            <Text type="secondary" className="label-medium">
                                <Space><FontAwesomeIcon icon={faWallet}/>Сервис</Space>
                            </Text>
                            <div className="mt-2 mb-2 d-flex flex-column gap-1 mb-3">
                                <Text strong copyable>{info.serviceName}</Text>
                                <Text type="secondary" className="label-medium" copyable>{info.serverName}</Text>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <MoneyColumn label="Внесено" value={record.total}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn label="Проведено" value={record.real_pay} color="#52c41a"/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn label="Комиссия" value={finance.commission}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn
                                    label="Иностр. валюта"
                                    value={record.real_pay_rur}
                                    prefix={<FontAwesomeIcon icon={faCoins}/>}
                                />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={9}>
                        <div className="p-3 rounded-3 h-100 bg-light border d-flex flex-column">
                            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" className="label-medium">Таймаут</Text>
                                    <div className='mt-2'>
                                        <Text strong>
                                            <FontAwesomeIcon icon={faClock} className="me-1 text-muted"/>
                                            {record.timeout} с
                                        </Text>
                                        {showActions && record.timeout > 0 && (
                                            <Button type="link" className="label-medium ">
                                                Сбросить
                                            </Button>
                                        )}
                                    </div>
                                </Space>
                                <Space direction="vertical" size={0} className="text-end">
                                    <Text type="secondary" className="label-medium mb-2">Уровень риска</Text>
                                    <div className='mt-2'>
                                        <Text strong className={record.additional2 > 29 ? 'af-high' : 'af-low'}>
                                            <Space>
                                                <small>{record.additional2 || 0} AF</small>
                                                -
                                                {record.additional2 > 79 ? 'ВЫСОКИЙ' : record.additional2 > 29 ? 'СРЕДНИЙ' : 'НИЗКИЙ'}
                                            </Space>
                                        </Text>
                                    </div>
                                </Space>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Text type="secondary" className="label-medium">Статус платежа:</Text>
                                    <Text copyable={{text: info.errorMessage}}/>
                                </div>
                                {info.errorMessage && (
                                    <div
                                        className={`status-info-box shadow-sm ${record.payments_run === RUN_STATUS.ERROR ? 'error' : record.payments_run === RUN_STATUS.SUCCESS ? 'success' : 'info'}`}>
                                        <div className="d-flex align-items-start">
                                            <FontAwesomeIcon
                                                icon={record.payments_run === RUN_STATUS.ERROR ? faCircleExclamation : record.payments_run === RUN_STATUS.SUCCESS ? faCheckCircle : faClock}
                                                className={`${record.payments_run === RUN_STATUS.ERROR ? 'text-danger' : record.payments_run === RUN_STATUS.SUCCESS ? 'text-success' : 'text-primary'} mt-1 me-2 label-medium`}
                                            />
                                            <div className="status-message-container">
                                                <Text className='label-medium status-message-text' italic>
                                                    {info.errorMessage}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={15}>
                        <div className="p-3 rounded-3 h-100 bg-light border">
                            <Text type="secondary" className="label-medium" uppercase>
                                <Space><FontAwesomeIcon icon={faLayerGroup}/> Дилер</Space>
                            </Text>
                            <div className="mt-2 mb-2 d-flex flex-column gap-1 mb-3">
                                <div className="d-flex justify-content-between">
                                    <Text strong copyable>{info.dealerName}</Text>
                                    <Text type="secondary" className="label-medium"
                                          copyable>{info.parentDealerName}</Text>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <Text type="secondary" className="label-medium" copyable={{text: info.apparatName}}>
                                        {info.apparatName}
                                    </Text>
                                    <Text type="secondary" className="label-medium">
                                        Тип аппарата: {TERMINAL_TYPES[info.apparat.terminal_type] || 'Неизвестно'}
                                    </Text>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <MoneyColumn label="Списано" value={finance.reduce}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn label="Чистое спис." value={finance.netWriteOff}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn label="Комис. QP" value={finance.comDlr}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn
                                    label="Вознаг. QP"
                                    value={finance.pFed}
                                    color={finance.pFed < 0 ? '#ff4d4f' : '#1677ff'}
                                />
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn label="Вознаг. дил." value={finance.pDlr}/>
                                <Divider type="vertical" className="finance-divider"/>
                                <MoneyColumn
                                    label="Доход дил."
                                    value={finance.income}
                                    color={finance.income < 0 ? '#ff4d4f' : '#1677ff'}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
                <CodeBlock code={Account2str(record.account)} title={'Дополнительные данные (Account)'}/>
            </div>
        </Card>
    );
};

export default PaymentDescriptionCard;
