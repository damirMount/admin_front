import React, {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Head from "next/head";
import {useSession} from "next-auth/react";
import {useAlert} from "../../contexts/AlertContext";
import RegistryNavigationTabs from "../../components/pages/registry/RegistryNavigationTabs";
import FormInput from "../../components/main/input/FormInput";
import Preloader from "../../components/main/system/Preloader";
import RegistryFileFormat from "../../components/pages/registry/RegistryFileFormat";
import UniversalSelect from "../../components/main/input/UniversalSelect";
import DateRangePicker from "../../components/main/input/DateRangePicker";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import ServiceByServerSelect from "../../components/main/input/ServiceByServerSelect";
import SmartTable from "../../components/main/table/SmartTable";
import {Popconfirm, Tooltip, Tour, Typography} from "antd";
import RegistryByRecipientSelect from "../../components/main/input/RegistryByRecipientSelect";
import {GET_PAYMENTS_API, REGISTRY_RESEND_API} from "../../routes/api";
import fetchData from "../../components/main/database/DataFetcher";
import {faEnvelope, faQuestionCircle} from "@fortawesome/free-regular-svg-icons";
import {faSearch, faXmark} from "@fortawesome/free-solid-svg-icons";

export default function RegistryResendPage() {
    const {data: session} = useSession();
    const {openNotification} = useAlert();
    const [tourOpen, setTourOpen] = useState(false);
    const [recipient, setRecipient] = useState(null);
    const [registry, setRegistry] = useState('');
    const [recipientOptions, setRecipientOptions] = useState([]);
    const [processingLoader, setProcessingLoader] = useState(false);
    const [paymentId, setPaymentId] = useState('');
    const [isSelectiveEmailEnabled, setIsSelectiveEmailEnabled] = useState(false);
    const [addedPayments, setAddedPayments] = useState([]);


    const refSendType = useRef(null);
    const refRecipient = useRef(null);
    const refRegistry = useRef(null);
    const refRegistryDataFormatType = useRef(null);
    const refDateToSend = useRef(null);
    const refRegistryFileFormat = useRef(null);
    const refAddPayment = useRef(null);
    const refFindPayment = useRef(null);
    const {Text, Title} = Typography;

    const [formData, setFormData] = useState({
        formats: [],
        send_type: null,
        services_id: [],
        startDate: null,
        endDate: null,
        selectiveEmail: null
    });

    const tableColumns = [
        {
            title: 'ID платежа',
            dataIndex: 'id',
            className: 'col-2 text-nowrap',
        },
        {
            title: 'Реквизит',
            dataIndex: 'identifier',
            className: 'col-7 text-nowrap',
        },
        {
            title: 'Сумма',
            dataIndex: 'real_pay',
            className: 'col-3 text-nowrap',
        },
        {
            title: 'Сервис',
            dataIndex: 'id_service',
            className: 'col-1 text-center',
            render: (text) => <span className='status status-small'>{text}</span>
        },
        {
            title: (
                <Tooltip placement="topRight" title="Помощь">
                    <button className="btn color-purple" type='button' onClick={() => setTourOpen(true)}>
                        <FontAwesomeIcon icon={faQuestionCircle} size="lg"/>
                    </button>
                </Tooltip>
            ),
            className: 'text-center',
            render: (text, record) => (
                <Popconfirm
                    placement="topLeft"
                    title="Вы уверены, что хотите удалить этот платеж?"
                    onConfirm={() => handleRemovePayment(record.key)}
                >
                    <Tooltip placement="topRight" title="Удалить платеж">
                        <button type="button" className="btn btn-light color-purple border">
                            <FontAwesomeIcon icon={faXmark}/>
                        </button>
                    </Tooltip>
                </Popconfirm>
            )
        }
    ];

    const validateForm = () => {
        try {
            if (formData.formats.length === 0) {
                throw new Error("Выберите хотя бы один формат");
            }
            if (isSelectiveEmailEnabled === true) {
                if (formData.selectiveEmail === null) {
                    throw new Error("Укажите почту для тестовой отправки реестра");
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.selectiveEmail)) {
                    throw new Error("Укажите корректный адрес электронной почты");
                }
            }
            return true;
        } catch (error) {
            openNotification({type: "error", message: error.message});
            return false;
        }
    };


    const tourSteps = [
        {
            title: 'Отправка реестра',
            description: 'На данной странице вы можете в ручную отправить реестр для поставщиков услуг, с возможностью ' +
                'корректировки некоторых настроек. От изменения почт получателя и формата реестра, до добавления ' +
                'недостающих платежей в файлы реестра.',
        },
        {
            title: 'Тип отправки реестра',
            description: <p>В этом поле вы выбираете, кому именно отправить данный реестр. У вас есть два варианта:
                <br/>
                <span className='fw-bold'>Отправить всем</span>: В этом случае реестр будет отправлен всем поставщикам,
                чьи электронные адреса указаны у выбранного Получателя. То есть, если у данного получателя есть
                несколько поставщиков с указанными электронными адресами, реестр будет отправлен каждому из них.
                <br/>
                <span className='fw-bold'>Выборочная отправка</span>: Здесь вы сами указываете электронный адрес,
                на который хотите отправить реестр. То есть, вы можете выбрать конкретного поставщика, которому хотите
                отправить реестр, указав его электронный адрес.</p>,
            target: () => refSendType.current,
        },
        {
            title: 'Получатель',
            description: 'Получатель определяет кому отправить реестры, а также предоставляет список реестров по которым' +
                'можно отправить данные. ',
            target: () => refRecipient.current,
        },
        {
            title: 'Реестр',
            description: 'Список реестров которые связаны с выбранным получателем ',
            target: () => refRegistry.current,
        },
        {
            title: 'Тип формирования реестра и услуги',
            description: <p>В этом поле вы выбираете, как будет формироваться данные этого реестра. У вас есть два
                варианта:
                <br/>
                <span className='fw-bold'>По услугам</span>: Выбрав этот вариант мы можете указать платежи по каким
                сервисам будут находится в реестре
                <br/>
                <span className='fw-bold'>По серверу</span>: В том же варианте платежи будут взяты по этому серверу и
                никак не будут разделяться. Поле с выбором услуг также пропадёт</p>,
            target: () => refRegistryDataFormatType.current,
        },
        {
            title: 'Период отправки',
            description: 'Здесь указывается промежуток времени за которое необходимо отправить платежи',
            target: () => refDateToSend.current,
        },
        {
            title: 'Формат реестра',
            description: 'Вы также можете выбрать формат в котором хотите отправить реестр. По стандарту здесь ' +
                'устанавливается значения которые были указаны в самом реестре ',
            target: () => refRegistryFileFormat.current,
        },
        {
            title: 'Добавление платежа',
            description: 'Также часто случается так что при отправки реестра необходимо добавить платёж которые был ' +
                'отправлен в другой день. Благодаря этому разделу вы можете это сделать',
            target: () => refAddPayment.current,
        },
        {
            title: 'Найти платёж в системе',
            description: 'Введите ID платежа, который хотите добавить, и нажмите на кнопку. После этого платёж появится ' +
                'в таблице. Важно: перед добавлением платежа убедитесь, что выбран правильный реестр, а также сервис ' +
                'или сервер совпадают с теми, через которые прошёл платёж. Кроме того, платёж должен иметь статус ' +
                '"проведён" не менее 10 минут, иначе система его не найдёт',
            target: () => refFindPayment.current,
        },
    ];

    const handlePaymentIdChange = (event) => {
        setPaymentId(event.target.value);
    };

    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };

    const handleAddPayment = async (event) => {
        event.preventDefault();

        const dataToSend = {
            paymentId,
            servicesList: formData.services_id,
            paymentsList: addedPayments
        };

        try {
            const response = await fetch(GET_PAYMENTS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({dataToSend}),
            });

            const responseData = await response.json();
            if (response.ok) {
                setAddedPayments((prevPayments) => [
                    ...prevPayments,
                    responseData.payment,
                ]);
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            openNotification({type: "error", message: "Ошибка при добавлении платежа"});
        }
    };

    const handleRemovePayment = (index) => {
        setAddedPayments((prevPayments) => {
            const updatedPayments = [...prevPayments];
            updatedPayments.splice(index, 1);
            return updatedPayments;
        });
    };

    const getRecipientsList = async () => {
        const fetchDataConfig = {
            model: 'Recipient',
            searchTerm: {is_blocked: false}
        };

        try {
            const recipientList = await fetchData(fetchDataConfig, session);
            setRecipientOptions(recipientList.data);
        } catch (error) {
            openNotification({type: 'error', message: `Ошибка при получении данных: ${error.message}`});
        }
    };

    const handleRecipientSelect = (recipientId) => {
        const selectedRecipient = recipientOptions.find(recipient => recipient.id === recipientId);

        setRecipient(selectedRecipient);
    };

    const handleSendRegistry = async () => {
        if (validateForm()) {
            try {
                const updatedFormData = {
                    ...formData,
                    registry_id: registry.id,
                    recipient_id: recipient.id,
                };

                const dataToSend = {
                    formData: updatedFormData,
                    addedPayments,
                };

                setProcessingLoader(true);

                const response = await fetch(REGISTRY_RESEND_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                    body: JSON.stringify(dataToSend),
                });

                const responseData = await response.json();
                if (response.ok) {
                    openNotification({type: "success", message: responseData.message});
                } else {
                    openNotification({type: "error", message: responseData.message});
                }
            } catch (error) {
                console.error('Ошибка при отправке реестра:', error);
                openNotification({type: "error", message: "Произошла ошибка при отправке реестра"});
            } finally {
                setProcessingLoader(false);
            }
        }
    };

    useEffect(() => {
        getRecipientsList();
    }, []);

    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={tourSteps}/>
                <Head>
                    <title>Отправка реестра | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div className="d-flex flex-column align-items-center">
                    <div className="container d-flex flex-column align-items-center body-container">
                        <h1>Отправка реестра</h1>
                        <RegistryNavigationTabs/>

                        {processingLoader && <Preloader/>}

                        <div className={`${processingLoader ? 'd-none' : 'd-flex '} flex-row w-100 mt-5 `}>
                            <div className="d-flex flex-row w-100 ">
                                <div className="d-flex flex-column w-50 mt-3 justify-content-start">
                                    <Title level={3}>Настройки реестра</Title>
                                    <div ref={refSendType}>
                                        <div className="form-group">
                                            <Text type="secondary" className="mb-1">
                                                Тип отправки реестра
                                            </Text>
                                            <div
                                                className="ps-3 input-form d-flex justify-content-between bg-white
                                                align-items-center">
                                                <label className='text-nowrap me-5 fw-normal'>Выберите опцию</label>
                                                <UniversalSelect
                                                    options={[
                                                        {value: false, label: 'Отправить всем'},
                                                        {value: true, label: 'Персонально'},
                                                    ]}
                                                    isSearchable={false}
                                                    selectedOptions={[isSelectiveEmailEnabled]}
                                                    onSelectChange={(selectedValue) => {
                                                        setIsSelectiveEmailEnabled(selectedValue);
                                                        setFormData((prevFormData) => ({
                                                            ...prevFormData,
                                                            isSelectiveEmailEnabled: selectedValue,
                                                        }));
                                                    }}
                                                    required
                                                    firstOptionSelected
                                                    className="selector-choice"
                                                    name="isSelectiveEmailEnabled"
                                                />
                                            </div>
                                        </div>

                                        {isSelectiveEmailEnabled && (
                                            <FormInput
                                                required
                                                label="Список email адресов"
                                                prefix={<FontAwesomeIcon icon={faEnvelope} size="lg"/>}
                                                type="email"
                                                id="email"
                                                placeholder="Укажите почту"
                                                value={formData.selectiveEmail || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    selectiveEmail: e.target.value
                                                })}
                                            />
                                        )}
                                    </div>
                                    <div ref={refRecipient}>

                                        <UniversalSelect
                                            key={JSON.stringify(recipientOptions)}
                                            label="Получатель"
                                            name='recipient_id'
                                            placeholder="Выберите получателя"
                                            options={recipientOptions.map(item => ({
                                                value: item.id,
                                                label: `${item.name} ${item.id}`
                                            }))}
                                            firstOptionSelected
                                            required
                                            onSelectChange={(selectedValue) => handleRecipientSelect(selectedValue)}
                                        />
                                    </div>
                                    {recipient && (
                                        <div>
                                            <div ref={refRegistry}>
                                                <RegistryByRecipientSelect
                                                    key={JSON.stringify(recipient)}
                                                    selectedRecipient={recipient.id}
                                                    selectedRegistry={registry}
                                                    onChange={(registry) => {
                                                        setRegistry(registry)
                                                        setFormData((prevFormData) => ({
                                                            ...prevFormData,
                                                            formats: registry.formats,
                                                        }));
                                                    }}
                                                />
                                            </div>
                                            <div ref={refRegistryDataFormatType}>
                                                <div className="form-group">
                                                    <Text type="secondary" className="mb-1">
                                                        Тип формирования реестра
                                                    </Text>
                                                    <div
                                                        className="ps-3 input-form d-flex justify-content-between
                                                        bg-white align-items-center">
                                                        <label className='text-nowrap me-5 fw-normal'>Выберите
                                                            опцию</label>
                                                        <UniversalSelect
                                                            key={JSON.stringify(registry)}
                                                            options={[
                                                                {value: 1, label: 'По услугам'},
                                                                {value: 2, label: 'По серверу'},
                                                            ]}
                                                            isSearchable={false}
                                                            selectedOptions={[registry.send_type]}
                                                            onSelectChange={(selectedValue) => {
                                                                setFormData((prevFormData) => ({
                                                                    ...prevFormData,
                                                                    send_type: selectedValue,
                                                                }));
                                                            }}
                                                            required
                                                            firstOptionSelected
                                                            className="selector-choice"
                                                            name="send_type"
                                                        />
                                                    </div>
                                                </div>
                                                {formData.send_type === 1 ? (
                                                    <ServiceByServerSelect
                                                        key={JSON.stringify(registry)}
                                                        selectedService={registry.services_id}
                                                        selectedServer={registry.server_id}
                                                        onChange={handleSelectorChange}
                                                    />
                                                ) : (
                                                    <div
                                                        className='d-flex user-select-none opacity-50 mt-5 mb-4
                                                        flex-column justify-content-center align-items-center'>
                                                        <FontAwesomeIcon icon={faEnvelope} size={'2xl'}/>
                                                        <h5>Отправка по серверу {registry.server_id}</h5>
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={refDateToSend}>
                                                <DateRangePicker
                                                    onDateChange={(dates) => {
                                                        setFormData((prevFormData) => ({
                                                            ...prevFormData,
                                                            startDate: dates[0],
                                                            endDate: dates[1],
                                                        }));
                                                    }}
                                                />
                                            </div>
                                            <div ref={refRegistryFileFormat}>
                                                <RegistryFileFormat
                                                    className='mt-3'
                                                    formData={registry}
                                                    setFormData={setFormData}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="container w-75  ms-3 d-flex mt-3 flex-column align-items-end"
                                     ref={refAddPayment}>
                                    <Title level={3} className="mb-3">Добавление платежа</Title>
                                    <div className="w-100 d-flex flex-column align-items-end">
                                        <SmartTable
                                            paginationPosition={['none']}
                                            rowClassName='w-100'
                                            columns={tableColumns}
                                            data={addedPayments}
                                        />
                                    </div>
                                    <div className="mt-4" ref={refFindPayment}>
                                        <label>Найти платёж в системе</label>
                                        <form className="d-flex flex-row justify-content-end"
                                              onSubmit={handleAddPayment}>
                                            <input
                                                className="form-control input-search"
                                                type="text"
                                                placeholder="Введите ID платежа"
                                                value={paymentId}
                                                onChange={handlePaymentIdChange}
                                            />
                                            <button
                                                className="btn btn-purple d-flex btn-search"
                                                type="submit"
                                            >
                                                <FontAwesomeIcon icon={faSearch} className="input-btn"/>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!processingLoader && recipient && (
                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-purple mt-5" onClick={handleSendRegistry}>
                                Отправить реестр
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedElement>
    );
}
