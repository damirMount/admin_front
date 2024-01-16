import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {parseCookies} from "nookies";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import SelectWithSearch from "../../../components/main/input/SelectWithSearch";
import MultiSelectWithSearch from "../../../components/main/input/MultiSelectWithSearch";
import FormInput from "../../../components/main/input/FormInput";
import Footer from "../../../components/main/Footer";
import Preloader from "../../../components/main/Preloader";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import CustomSelect from "../../../components/main/input/CustomSelect";
import {
    GET_LIST_SERVICES_URL,
    GET_PAYMENTS_URL,
    GET_RECIPIENTS_URL,
    GET_REGISTRIES_URL,
    REGISTRY_RESEND_URL
} from "../../../routes/api";
import Head from "next/head";
import DateRangeInput from "../../../components/main/input/DateRangeInput";
import RegistryFileFormat from "../../../components/pages/registry/RegistryFileFormat";
import {useAlert} from '../../../contexts/AlertContext';


export default function IndexPage() {
    const [recipient, setRecipient] = useState('');
    const [registries, setRegistries] = useState([]);
    const [selectedRegistry, setSelectedRegistry] = useState('');
    const [selectedLastRegistry, setSelectedLastRegistry] = useState('');
    const [defaultServicesId, setDefaultServicesId] = useState([]);
    const [showRegistry, setShowRegistry] = useState(false);
    const [processingLoader, setProcessingLoader] = useState(false);
    const [paymentId, setPaymentId] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [isTestEmailEnabled, setTestEmailEnabled] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const {clearAlertMessage, showAlertMessage} = useAlert();

    const handleChange = (event) => {
        setPaymentId(event.target.value);
    };

    const [formData, setFormData] = useState({
        formats: [],
        services_id: [],
        startDate: null,
        endDate: null,
        testEmail: null
    });
    const [rows, setRows] = useState([]);

    const validateForm = () => {
        try {
            if (formData.formats.length === 0) {
                throw new Error("Выберите хотя бы один формат");
            }
            if (isTestEmailEnabled) {
                if (formData.testEmail === null) {
                    throw new Error("Укажите почту для тестовой отправки реестра");
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.testEmail)) {
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

    const handleEmailChange = (e) => {
        const newTestEmail = e.target.value;
        setTestEmail(newTestEmail);
        setFormData((prevFormData) => ({
            ...prevFormData,
            testEmail: newTestEmail,
        }));
    };
    const handleRecipientChange = async (selectedValue) => {
        setSelectedLastRegistry(' ')
        try {
            setRecipient(selectedValue);
            setShowRegistry(true);

            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const getRegistryApiUrl = `${GET_REGISTRIES_URL}`;
            const encodedValue = encodeURIComponent(selectedValue);
            const column = 'recipient_id';

            const response = await fetch(
                `${getRegistryApiUrl}?column=${column}&value=${encodedValue}&includeRelated=true&onlyActive=true`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const responseData = await response.json();

            setRegistries(responseData);

            if (responseData.length > 0) {
                const selectedRegistry = responseData[0];
                const selectedFormats = selectedRegistry.formats;

                setSelectedRegistry(selectedRegistry.id);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    formats: selectedFormats,
                }));

                await fetchServicesByRegistry(selectedRegistry.services_id);

            }
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };

    const fetchServicesByRegistry = async (services) => {
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const getServicesByRegistryApiUrl = `${GET_LIST_SERVICES_URL}`;
            // const column = 'id';
            const queryParams = services.map((serviceId) => `value[]=${encodeURIComponent(serviceId)}`).join('&');
            const queryString = `column=id&${queryParams}`;


            const response = await fetch(
                `${getServicesByRegistryApiUrl}?${queryString}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const responseData = await response.json();

            setDefaultServicesId(responseData.map((service) => service.id))
            setFormData((prevFormData) => ({
                ...prevFormData,
                services_id: responseData.map((service) => service.id),
            }));
        } catch (error) {
            console.error('Ошибка при получении данных сервисов:', error);
        }
    };

    const handleRegistryChange = async (selectedValue) => {
        try {
            const registry = registries.find((reg) => reg.id === selectedValue);
            setSelectedRegistry(selectedValue);
            const selectedFormats = registry.formats;

            if (selectedRegistry && registry.services_id) {
                await fetchServicesByRegistry(registry.services_id);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    formats: selectedFormats,
                }));
            } else {
                console.error('Реестр или services_id не найдены');
            }

        } catch (error) {
            console.error('Ошибка при обработке изменения реестра:', error);
        }
    };


    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleAddColumn = async (event) => {
        event.preventDefault();


        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;

        const getPaymentApi = `${GET_PAYMENTS_URL}`;

        const dataToSend = {
            paymentId: paymentId,
            servicesList: formData.services_id,
            paymentsList: rows
        }

        try {
            // Исправление: передача paymentId как объекта вместо строки
            const response = await fetch(getPaymentApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                // Исправление: преобразование paymentId в JSON перед отправкой
                body: JSON.stringify({
                    dataToSend
                }),
            });

            // Исправление: парсинг JSON из ответа
            const responseData = await response.json();
            // Исправление: проверка, что ответ успешен, прежде чем обновлять состояние
            if (response.ok) {
                // setAlertMessage({ type: "success", text: responseData.message });

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
        setSelectedLastRegistry(selectedRegistry)
        if (validateForm()) {

            try {
                const dataToSend = {
                    recipient,
                    isTestEmailEnabled,
                    selectedRegistry,
                    formData,
                    rows,
                };
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;

                const sendRegistryApiUrl = `${REGISTRY_RESEND_URL}`;

                setProcessingLoader(true); // Показать прелоадер

                const response = await fetch(sendRegistryApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
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
    const handleDateChange = (newStartDate, newEndDate) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

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
                <div className="container d-flex flex-column align-items-center body-container mt-5">
                    <h1>Перезапуск реестра</h1>
                    <RegistryNavigationTabs/>

                    <div className="d-flex flex-row w-100 mt-5">
                        {processingLoader ? (
                            <Preloader/>
                        ) : (
                            <div className="d-flex flex-row w-100">
                                <div className="d-flex flex-column w-50 mt-3 justify-content-start">

                                    <h3>Перезапуск реестра</h3>
                                    <div className="form-group">
                                        <label htmlFor="isTestEmailEnabled">Тип отправки реестра</label>
                                        <div
                                            className="ps-3 input-form d-flex justify-content-between bg-white align-items-center">
                                            <label htmlFor="">Выберете опцию</label>
                                            <CustomSelect
                                                options={[
                                                    {value: false, label: 'Обычная отправка'},
                                                    {value: true, label: 'Тестовая отправка'},
                                                ]}
                                                required
                                                onSelectChange={(selectedOption) =>
                                                    setTestEmailEnabled(selectedOption)
                                                }
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
                                        <label htmlFor="recipientId">Получатель</label>
                                        <SelectWithSearch
                                            apiUrl={`${GET_RECIPIENTS_URL}`}
                                            required
                                            name="recipientId"
                                            onSelectChange={handleRecipientChange}
                                            defaultValue={recipient}
                                        />
                                    </div>

                                    {showRegistry && (

                                        <div>
                                            <div className="form-group">
                                                <label htmlFor="registryId">Реестр </label>
                                                <CustomSelect
                                                    options={registries.map((item) => ({
                                                        value: item.id,
                                                        label: `${item.name} ${selectedRegistry.toString()}`
                                                    }))}
                                                    onSelectChange={handleRegistryChange}
                                                    selectedValue={selectedRegistry}
                                                />
                                            </div>

                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="serverId">Сервисы</label>
                                                    <MultiSelectWithSearch
                                                        apiUrl={`${GET_LIST_SERVICES_URL}`}
                                                        required
                                                        name="services_id"
                                                        multi={true}
                                                        onlyDefaultValue={true}
                                                        placeholder="Выберете сервис"
                                                        onSelectChange={(selectedValues) =>
                                                            handleInputChange({
                                                                target: {
                                                                    name: 'services_id',
                                                                    value: selectedValues,
                                                                },
                                                            })
                                                        }
                                                        options={defaultServicesId.map((item) => ({
                                                            value: item.id,
                                                            label: item.name,
                                                        }))}
                                                        defaultValue={Array.isArray(defaultServicesId)
                                                            ? defaultServicesId
                                                            : []}
                                                        selectedValue={formData.services_id}
                                                        selectedRegistry={selectedRegistry}
                                                        selectedLastRegistry={selectedLastRegistry}
                                                    />
                                                </div>


                                                <DateRangeInput
                                                    initialStartDate={startDate}
                                                    initialEndDate={endDate}
                                                    onDateChange={handleDateChange}
                                                />


                                                <div className="form-group d-flex align-items-center flex-column mt-4">
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
                                                                  className="status status-active w-100 d-flex justify-content-center">{row.id_service}</span>
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
                        )}
                    </div>
                </div>
                {processingLoader !== true && showRegistry && (
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-purple mt-5" onClick={handleSendRegistry}>
                            Отправить реестр
                        </button>
                    </div>
                )}
            </div>
            <Footer></Footer>
        </div>
    );
}
