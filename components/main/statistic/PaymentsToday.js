import {Divider, Skeleton, Statistic, Tooltip, Typography} from "antd";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faClockRotateLeft, faMoneyBillTrendUp, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import {faCircleCheck} from "@fortawesome/free-regular-svg-icons/faCircleCheck";
import {MoneyFormatNumber} from "../system/MoneyFormatNumber";

const {Text} = Typography;

const PaymentsToday = ({data, loading = true}) => {

    return (<div className="card mt-2">
        <div className="card-body">
            <div className="d-flex flex-column justify-content-between w-100">
                <Divider className="mt-0">Статистика за день</Divider>

                <div className="d-flex align-items-center">
                    <span
                        className="bg-success d-flex align-items-center justify-content-center text-white rounded-1 shadow"
                        style={{height: 54, width: 70}}
                    >
                        <FontAwesomeIcon className="fs-4" icon={faCircleCheck}/>
                    </span>
                    <div className="d-flex flex-column ms-2 w-100">
                        <div className="d-flex flex-row w-100 justify-content-between align-items-end text-center">
                            <Text type="secondary">Успешные</Text>
                            <Text type="secondary">Кол-во</Text>
                            {/*<Text type="danger" className="fw-bold">*/}
                            {/*    <CaretDownOutlined/>15%*/}
                            {/*</Text>*/}
                        </div>
                        {loading ? (<Skeleton.Input className="w-100" active size={'small'}/>) : (
                            <div className="d-flex flex-row w-100 justify-content-between align-items-end">
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].success_total_pay, 'full') + ' сом' : 0}
                                >
                                    <Text className="fs-4">
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].success_total_pay) : 0}
                                    </Text>
                                </Tooltip>
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].success_total_count, 'full') + ' платежей' : 0}
                                >
                                    <Text className="fs-5" type="secondary">
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].success_total_count) : 0}
                                    </Text>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
                <div className='d-flex align-items-center'>
                    <span
                        className='bg-warning d-flex align-items-center justify-content-center text-white p-3 rounded-1
                        shadow'
                        style={{height: 'fit-content'}}>
                          <FontAwesomeIcon className='fs-5' icon={faClockRotateLeft}/>
                    </span>
                    <div className='d-flex flex-column ms-2 w-100'>
                        <div className='d-flex flex-row w-100 justify-content-between align-items-end text-center'>
                            <Text type="secondary">
                                В обработке
                            </Text>
                            <Text type="secondary">Кол-во</Text>
                            {/*<Text type="danger" className='fw-bold'>*/}
                            {/*    <CaretDownOutlined/>15%*/}
                            {/*</Text>*/}
                        </div>
                        {loading ? (<Skeleton.Input className="w-100 mt-2" active size={'small'}/>) : (
                            <div className='d-flex flex-row w-100 justify-content-between align-items-end'>
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].processing_total_pay, 'full') + ' сом' : 0}>
                                    <Text className='fs-4'>
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].processing_total_pay) : 0}
                                    </Text>
                                </Tooltip>
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].processing_total_count, 'full') + ' платежей' : 0}>
                                    <Text className='fs-5' type='secondary'>
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].processing_total_count) : 0}
                                    </Text>
                                </Tooltip>
                            </div>)
                        }
                    </div>
                </div>
                <div className='d-flex align-items-center'>
                    <span
                        className='bg-danger d-flex align-items-center justify-content-center text-white p-3 rounded-1
                        shadow'
                        style={{height: 'fit-content'}}>
                        <FontAwesomeIcon className='fs-5' icon={faBan}/>
                    </span>
                    <div className='d-flex flex-column ms-2 w-100'>
                        <div className='d-flex flex-row w-100 justify-content-between align-items-end text-center'>
                            <Text type="secondary">
                                Ошибочные
                            </Text>
                            <Text type="secondary">Кол-во</Text>
                            {/*<Text type="danger" className='fw-bold'>*/}
                            {/*    <CaretDownOutlined/>15%*/}
                            {/*</Text>*/}
                        </div>
                        {loading ? (<Skeleton.Input className="w-100 mt-2" active size={'small'}/>) : (
                            <div className='d-flex flex-row w-100 justify-content-between align-items-end'>
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].error_total_pay, 'full') + ' сом' : 0}>
                                    <Text className='fs-4'>
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].error_total_pay) : 0}
                                    </Text>
                                </Tooltip>
                                <Tooltip
                                    title={data.length > 0 ? MoneyFormatNumber(data[data.length - 1].error_total_count, 'full') + ' платежей' : 0}>
                                    <Text className='fs-5' type='secondary'>
                                        {data.length > 0 ? MoneyFormatNumber(data[data.length - 1].error_total_count) : 0}
                                    </Text>
                                </Tooltip>
                            </div>)
                        }
                    </div>
                </div>
                <Divider variant="dashed" dashed/>
                <Statistic
                    prefix={<FontAwesomeIcon icon={faSackDollar} className="color-purple me-2"/>}
                    title={'Принято ' + (data.length > 0 ? data[data.length - 1].total_count : 0) + ' платежей'}
                    value={data.length > 0 ? data[data.length - 1].total_pay : 0}
                    precision={2}
                    suffix={'сом'}
                    loading={loading}
                />
                <Statistic
                    prefix={<FontAwesomeIcon icon={faMoneyBillTrendUp} className="color-purple me-2"/>}
                    title={'Проведено ' + (data.length > 0 ? data[data.length - 1].success_total_count : 0) + ' платежей'}
                    value={data.length > 0 ? data[data.length - 1].real_pay : 0}
                    precision={2}
                    suffix={'сом'}
                    loading={loading}
                />
            </div>
        </div>
    </div>);
};

export default PaymentsToday;
