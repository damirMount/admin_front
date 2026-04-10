import React from 'react';
import {Button, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {MoneyFormatNumber} from "../../../../../../components/main/system/MoneyFormatNumber";
import FormatDate from "../../../../../../components/main/system/FormatDate";
import {findById} from "../../../../../../components/main/system/FindById";

const {Text} = Typography;

const TransactionPreview = ({payment, dealersList, apparatsList}) => {


    const dealer = findById(dealersList, payment.id_region);
    const apparat = findById(apparatsList, payment.id_apparat);

    return (
        <div style={{width: '300px'}}>
            <div className="d-flex justify-content-between align-items-center">
                <Text strong style={{fontSize: '12px'}}>
                    Транзакция #{payment.id}
                </Text>
                <FontAwesomeIcon
                    icon={Icons.faArrowUpRightFromSquare}
                    style={{fontSize: '10px', color: '#94a3b8'}}
                />
            </div>
            <div className="p-2">
                <div className="mb-2 d-flex flex-column">
                    <Text type="secondary" style={{fontSize: '11px'}}>Дилер:</Text>
                    <Text strong copyable>
                        {dealer.name ? `${dealer.id} ${dealer.name}` : `ID: ${payment.id_region || '?'}`}
                    </Text>
                </div>
                <div className="mb-2 d-flex flex-column">
                    <Text type="secondary" style={{fontSize: '11px'}}>Аппарат:</Text>
                    <Text strong copyable>
                        {apparat.name ? `${apparat.id} ${apparat.name}` : `ID: ${payment.id_apparat || '?'}`}
                    </Text>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                    <div>
                        <Text type="secondary" style={{fontSize: '11px', display: 'block'}}>Сумма:</Text>
                        <Text strong style={{color: '#52c41a'}}>
                            {payment.total ? MoneyFormatNumber(payment.total, 'full') : '0'} сом
                        </Text>
                    </div>
                    <div className="text-end">
                        <Text type="secondary" style={{fontSize: '11px', display: 'block'}}>Дата:</Text>
                        <Text strong>{payment.time ? FormatDate(payment.time) : '-'}</Text>
                    </div>
                </div>
                <Button
                    size="small"
                    type="primary"
                    block
                    onClick={() => {
                        {
                            return window.open(
                                `https://kg.quickpay.kg/idx.php/report?filter%5BreportType%5D=detail-report&filter%5Bid%5D=${payment.id}`,
                                '_blank'
                            );
                        }
                    }}
                >
                    Детали в биллинге
                </Button>
            </div>
        </div>
    );
};

export default TransactionPreview;
