import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import FormInput from "../../../components/main/input/FormInput";
import Preloader from "../../../components/main/system/Preloader";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {GET_PAYMENTS_API, REGISTRY_RESEND_API} from "../../../routes/api";
import Head from "next/head";
import RegistryFileFormat from "../../../components/pages/registry/RegistryFileFormat";
import {useAlert} from '../../../contexts/AlertContext';
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import fetchData from "../../../components/main/database/DataFetcher";
import {value} from "lodash/seq";
import {useSession} from "next-auth/react";
import DateRangeInput from "../../../components/main/input/DateRangeInput";


export default function RegistryResendPage() {
    const [recipient, setRecipient] = useState('');
    const [registry, setRegistry] = useState('');
    const [services, setServices] = useState('');
    const [registryOptions, setRegistryOptions] = useState('');
    const {data: session} = useSession(); // Получаем сессию
    const [processingLoader, setProcessingLoader] = useState(false);
    const [paymentId, setPaymentId] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [isTestEmailEnabled, setIsTestEmailEnabled] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [rows, setRows] = useState([]);
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const [formData, setFormData] = useState({
        formats: [],
        services_id: [],
        startDate: null,
        endDate: null,
        testEmail: null
    });

    const validateForm = () => {
        try {
            if (formData.formats.length === 0) {
                throw new Error("Выберите хотя бы один формат");
            }
            if (isTestEmailEnabled === true) {
                if (testEmail === null) {
                    throw new Error("Укажите почту для тестовой отправки реестра");
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(testEmail)) {
                    throw new Error("Укажите корректный адрес электронной почты");
                }
            }
            return true;
        } catch (error) {
            console.error('Ошибка валидации формы:', error.message);
            showAlertMessage({type: "error", text: error.message});
            return false;
        }
    };

    const handleChange = (event) => {
        setPaymentId(event.target.value);
    };
    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };

    const handleEmailChange = (e) => {
        const newTestEmail = e.target.value;
        setTestEmail(newTestEmail);
        setFormData((prevFormData) => ({
            ...prevFormData,
            testEmail: newTestEmail,
        }));
    };

    const handleDateChange = (newStartDate, newEndDate) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const handleAddColumn = async (event) => {
        event.preventDefault();


        const dataToSend = {
            paymentId: paymentId,
            servicesList: formData.services_id,
            paymentsList: rows
        }

        try {
            const response = await fetch(GET_PAYMENTS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    dataToSend
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                setRows((prevRows) => [
                    ...prevRows,
                    {
                        id: responseData.payment.id,
                        identifier: responseData.payment.identifier,
                        real_pay: responseData.payment.real_pay,
                        id_service: responseData.payment.id_service
                    },
                ]);

            } else {
                showAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    };

    const handleRemoveColumn = (index) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows.splice(index, 1);
            return updatedRows;
        });
    };

    const handleSendRegistry = async () => {
        if (validateForm()) {

            try {
                const dataToSend = {
                    recipient,
                    formData,
                    rows,
                };

                const sendRegistryApiUrl = `${REGISTRY_RESEND_API}`;

                setProcessingLoader(true); // Показать прелоадер

                const response = await fetch(sendRegistryApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                    body: JSON.stringify(dataToSend),
                });

                const responseData = await response.json();

                if (response.ok) {
                    showAlertMessage({type: "success", text: responseData.message});
                } else {
                    showAlertMessage({type: "error", text: responseData.message});
                }
            } catch (error) {
                console.error('Ошибка при отправке реестра:', error);
                showAlertMessage({type: "error", text: "Произошла ошибка при отправке реестра"});
            } finally {
                setProcessingLoader(false); // Скрыть прелоадер после получения ответа или в случае ошибки
            }
        }
    };

    const handleRegistrySelect = () => {
        const selectedRegistry = Array.isArray(registryOptions)
            ? registryOptions.find(item => item.id === registry)
            : registryOptions;

        let formats = [];

        if (selectedRegistry) {
            formats = selectedRegistry.formats
            setServices(selectedRegistry.services_id)
        } else {
            formats = []
            setServices([])
        }

        setFormData((prevFormData) => ({
            ...prevFormData,
            formats: formats,
        }));
    }

    const handleRegistry = () => {
        const fetchRegistryRelation = {
            model: 'RecipientRegistry',
            searchTerm: {recipient_id: recipient, accurateSearch: true},
        };


        const fetchDataAndSetOptions = async () => {
            try {
                const relationOptions = await fetchData(fetchRegistryRelation, session);

                const fetchRegistry = {
                    model: 'Registry',
                    searchTerm: {
                        id: (Array.isArray(relationOptions.data)
                            ? relationOptions.data.map(item => item.registry_id)
                            : relationOptions.data.registry_id)
                    }
                };

                const registryList = await fetchData(fetchRegistry, session);
                setRegistryOptions(registryList.data);

            } catch (error) {
                showAlertMessage({
                    type: 'error',
                    text: 'Ошибка при получении данных: ' + error.message,
                });
            }
        };

        fetchDataAndSetOptions();
    }

    useEffect(() => {
        handleRegistrySelect()
    }, [registry]);

    useEffect(() => {
        handleRegistry()
    }, [recipient]);

    useEffect(() => {
        clearAlertMessage();
        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: startDate,
            endDate: endDate,
        }));
    }, [startDate, endDate]);


    return (
        <div>
            <Head>
                <title>Перезапуск реестра | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>

            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="container d-flex flex-column align-items-center body-container">
                    <h1>Перезапуск реестра</h1>
                    <RegistryNavigationTabs/>

                    {processingLoader && (
                        <Preloader/>
                    )}

                    <div className={`${processingLoader ? 'd-none' : 'd-flex'} flex-row w-100 mt-5`}>
                        <div className="d-flex flex-row w-100">
                            <div className="d-flex flex-column w-50 mt-3 justify-content-start">

                                <h3>Перезапуск реестра</h3>
                                <div className="form-group">
                                    <label htmlFor="isTestEmailEnabled">Тип отправки реестра</label>
                                    <div
                                        className="ps-3 input-form d-flex justify-content-between bg-white align-items-center">
                                        <label htmlFor="">Выберете опцию</label>
                                        <UniversalSelect
                                            options={[
                                                {value: false, label: 'Обычная отправка'},
                                                {value: true, label: 'Тестовая отправка'},
                                            ]}
                                            selectedOptions={[isTestEmailEnabled]}
                                            onSelectChange={(selectedValue) => {
                                                setIsTestEmailEnabled(selectedValue);
                                                setFormData((prevFormData) => ({
                                                    ...prevFormData,
                                                    isTestEmailEnabled: selectedValue,
                                                }));
                                            }}
                                            required
                                            firstOptionSelected
                                            className="selector-choice"
                                            name="isTestEmailEnabled"
                                        />
                                    </div>
                                </div>

                                {isTestEmailEnabled && (
                                    <div className="form-group w-100">
                                        <label htmlFor="email">Тестовая почта</label>
                                        <div>
                                            <FontAwesomeIcon className="input-icon" icon={faEnvelope} size="lg"/>
                                            <FormInput
                                                required
                                                type="email"
                                                id="email"
                                                className="mail-input input-with-padding"
                                                placeholder="Укажите почту"
                                                value={testEmail}
                                                onChange={handleEmailChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="recipient_id">Получатель</label>
                                    <UniversalSelect
                                        name='recipient_id'
                                        // selectedOptions={recipient}
                                        placeholder="Выберете получателя"
                                        fetchDataConfig={{
                                            model: 'Recipient',
                                            searchTerm: {is_blocked: false}
                                        }}
                                        firstOptionSelected
                                        required
                                        onSelectChange={(selectedValue, name) => {
                                            handleSelectorChange(selectedValue, name);
                                            setRecipient(selectedValue);
                                        }}
                                    />
                                </div>

                                {recipient > 0 && (
                                    <div>
                                        <div className="form-group">
                                            <label htmlFor="registry_id">Реестр</label>
                                            <UniversalSelect
                                                key={JSON.stringify(registryOptions)}
                                                name='registry_id'
                                                placeholder="Выберете файлы реестров"
                                                options={registryOptions && registryOptions.length > 0 ? (
                                                    registryOptions.map((item) => ({
                                                        value: item.id,
                                                        label: `${item.name} ${item.id}`
                                                    }))
                                                ) : []}
                                                firstOptionSelected
                                                required
                                                isSearchable={false}
                                                onSelectChange={(selectedValue, name) => {
                                                    handleSelectorChange(Number(selectedValue), name);
                                                    setRegistry(Number(selectedValue))
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="form-group">
                                                <label htmlFor="serverId">Сервисы</label>

                                                <UniversalSelect
                                                    key={JSON.stringify(services)}
                                                    name='services_id'
                                                    fetchDataConfig={{
                                                        model: 'Service',
                                                        searchTerm: {id: services}
                                                    }}
                                                    placeholder="Выберете сервисы"
                                                    selectedOptions={services}
                                                    onSelectChange={handleSelectorChange}
                                                    required
                                                    isMulti
                                                />
                                            </div>
                                            <DateRangeInput
                                                initialStartDate={startDate}
                                                initialEndDate={endDate}
                                                onDateChange={handleDateChange}
                                            />
                                            <div
                                                className="form-group d-flex align-items-center flex-column mt-4">
                                                <RegistryFileFormat
                                                    formData={formData}
                                                    setFormData={setFormData}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="container w-75 ms-3 d-flex mt-3 flex-column align-items-end">
                                <h3 className="mb-3">Добавление платежа</h3>
                                {rows.length > 0 && (
                                    <div className="w-100 d-flex flex-column align-items-end">
                                        <label>
                                            Добавленные платежи в реестр
                                        </label>
                                        <table className="table table-bordered w-100">
                                            <thead>
                                            <tr>
                                                <th className="col-2">ID платежа</th>
                                                <th scope="col">Реквизит</th>
                                                <th className="col-2">Сумма</th>
                                                <th className="col-1">Сервис</th>
                                                <th scope="col"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {row.id}
                                                    </td>
                                                    <td>
                                                        {row.identifier}
                                                    </td>
                                                    <td>
                                                        {row.real_pay}
                                                    </td>
                                                    <td>
                                                        <span key={index}
                                                              className="status status-active w-100 d-flex justify-content-center">
                                                            {row.id_service}
                                                        </span>
                                                    </td>
                                                    <td className="w-0">
                                                        <button
                                                            type="button"
                                                            className="btn btn-purple"
                                                            onClick={() => handleRemoveColumn(index)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} size="xl"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="d-flex flex-row mt-4">
                                    <form className="d-flex justify-content-end">
                                        <input
                                            className="form-control input-search"
                                            type="text"
                                            placeholder="Введите ID платежа"
                                            value={paymentId}
                                            onChange={handleChange}
                                        />
                                        <button
                                            className="btn btn-purple d-flex btn-search"
                                            type="button"
                                            onClick={handleAddColumn}
                                        >
                                            <FontAwesomeIcon icon={faSearch} className="input-btn"/>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!processingLoader && recipient > 0 && (
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-purple mt-5" onClick={handleSendRegistry}>
                            Отправить реестр
                        </button>
                    </div>
                )}

            </div>

        </div>
    );
}
