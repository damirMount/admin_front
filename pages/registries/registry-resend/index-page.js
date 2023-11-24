import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrashAlt, faSearch, faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import { parseCookies } from "nookies";

import Navigation from "../../../components/Navigation";
import RegistryTabs from "../../../components/RegistryTabs";
import SelectWithSearch from "../../../components/SelectWithSearch";
import MultiSelectWithSearch from "../../../components/MultiSelectWithSearch";
import FormInput from "../../../components/FormInput";
import Footer from "../../../components/Footer";
import Preloader from "../../../components/Preloader";
import Alert from "../../../components/Alert";
import {faEnvelope, faXmarkCircle} from "@fortawesome/free-regular-svg-icons";
import CustomSelect from "../../../components/CustomSelect";


export default function IndexPage() {
    const [recipient, setRecipient] = useState('');
    const [registries, setRegistries] = useState([]);
    const [selectedRegistry, setSelectedRegistry] = useState('');
    const [selectedLastRegistry, setSelectedLastRegistry] = useState('');
    const [defaultServicesId, setDefaultServicesId] = useState([]);
    const [showRegistry, setShowRegistry] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCheckboxCount, setSelectedCheckboxCount] = useState(0);
    const [processingLoader, setProcessingLoader] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
    const [paymentId, setPaymentId] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [isTestEmailEnabled, setTestEmailEnabled] = useState(false);

    // Функция для обновления состояния при изменении инпута
    const handleChange = (event) => {
        setPaymentId(event.target.value);
    };
    const clearAlertMessage = () => {
        setAlertMessage({ type: "", text: "" });
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
            setAlertMessage({ type: "error", text: error.message });
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
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData((prevFormData) => {
            const formats = [...prevFormData.formats];
            if (checked && !formats.includes(name)) {
                formats.push(name);
            } else if (!checked && formats.includes(name)) {
                formats.splice(formats.indexOf(name), 1);
            }
            return {
                ...prevFormData,
                formats,
            };
        });
    };

    const handleRecipientChange = async (selectedValue) => {
        setSelectedLastRegistry(' ')
        try {
            setRecipient(selectedValue);
            setShowRegistry(true);

            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const getRegistryApiUrl = `${process.env.NEXT_PUBLIC_GET_REGISTRYS_URL}`;
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

            const getServicesByRegistryApiUrl = `${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`;
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
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleAddColumn = async (event) => {
        event.preventDefault();


            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const getPaymentApi = `${process.env.NEXT_PUBLIC_GET_PAYMENTS_URL}`;

            const dataToSend = {
                paymentId: paymentId,
                servicesList: formData.services_id,
                paymentsList: rows
            }

            console.log(dataToSend)
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
                    setAlertMessage({type: "error", text: responseData.message});
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

                const sendRegistryApiUrl = `${process.env.NEXT_PUBLIC_REGISTRY_RESEND_URL}`;

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
                    setAlertMessage({type: "success", text: responseData.message});
                } else {
                    setAlertMessage({type: "error", text: responseData.message});
                }
            } catch (error) {
                console.error('Ошибка при отправке реестра:', error);
                setAlertMessage({type: "error", text: "Произошла ошибка при отправке реестра"});
            } finally {
                setProcessingLoader(false); // Скрыть прелоадер после получения ответа или в случае ошибки
            }
        }
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: newStartDate,
        }));
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        setFormData((prevFormData) => ({
            ...prevFormData,
            endDate: newEndDate,
        }));
    };


    useEffect(() => {
        console.log(isTestEmailEnabled)

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().substr(0, 10);
        const startOfDay = `${yesterdayString}`;
        const endOfDay = `${yesterdayString}`;

        setStartDate(startOfDay);
        setEndDate(endOfDay);

        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: startOfDay,
            endDate: endOfDay,
        }));
    }, []);

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div>
                <Alert alertMessage={alertMessage} clearAlertMessage={clearAlertMessage} />
            </div>
            <div className="d-flex flex-column align-items-center">
                <div className="container d-flex flex-column align-items-center body-container mt-5">
                    <h1>Перезапуск реестра</h1>
                    <RegistryTabs />

                    <div className="d-flex flex-row w-100 mt-5">
                        {processingLoader ? (
                            <Preloader />
                        ) : (
                            <div className="d-flex flex-row w-100">
                        <div className="d-flex flex-column w-50 mt-3 justify-content-start">

                            <h3>Перезапуск реестра</h3>
                            <div className="form-group">
                                <label htmlFor="isTestEmailEnabled">Тип отправки реестра</label>
                                <div className="ps-3 input-form d-flex justify-content-between bg-white align-items-center">
                                    <label htmlFor="">Выберете опцию</label>
                                    <CustomSelect
                                        options={[
                                            { value: false, label: 'Обычная отправка' },
                                            { value: true, label: 'Тестовая отправка' },
                                        ]}
                                        defaultValue={{ value: false, label: 'Обычная отправка' }}
                                        selectedValue={isTestEmailEnabled ? { value: true, label: 'Тестовая отправка' } : { value: false, label: 'Обычная отправка' }}
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
                                        <FontAwesomeIcon className="input-icon" icon={faEnvelope} size="lg" />
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
                                    apiUrl={`${process.env.NEXT_PUBLIC_GET_RECIPIENTS_URL}`}
                                    required
                                    name="recipientId"
                                    onSelectChange={handleRecipientChange}
                                    defaultValue={recipient}
                                />
                            </div>

                            {showRegistry && (

                                <div>
                                    <div className="form-group">
                                        <label htmlFor="registryId">Реестр</label>
                                        <SelectWithSearch
                                            apiUrl={`${process.env.NEXT_PUBLIC_GET_REGISTRYS_URL}`}
                                            options={registries.map((item) => ({
                                                value: item.id,
                                                label: item.name,
                                            }))}
                                            onSelectChange={handleRegistryChange}
                                            defaultValue={selectedRegistry}
                                        />
                                    </div>

                                    <div>
                                        <div className="form-group">
                                            <label htmlFor="serverId">Сервисы</label>
                                            <MultiSelectWithSearch
                                                apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`}
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
                                                selectedValue = {formData.services_id}
                                                selectedRegistry = {selectedRegistry}
                                                selectedLastRegistry = {selectedLastRegistry}
                                            />
                                        </div>
                                        <div className="d-flex w-100 justify-content-between">
                                            <div className="form-group me-3">
                                                <label htmlFor="startDate">Дата начала</label>
                                                <input
                                                    type="date"
                                                    className="input-field pe-2"
                                                    id="startDate"
                                                    name="startDate"
                                                    value={startDate}
                                                    onChange={handleStartDateChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group ms-3">
                                                <label htmlFor="endDate">Дата конца</label>
                                                <input
                                                    type="date"
                                                    className="input-field pe-2"
                                                    id="endDate"
                                                    name="endDate"
                                                    value={endDate}
                                                    onChange={handleEndDateChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group d-flex align-items-center flex-column mt-4">
                                            <div className="d-flex justify-content-evenly w-50">
                                                <div>
                                                    <input
                                                        autoComplete="off"
                                                        id="btn-xlsx"
                                                        className="btn-checked btn-grey"
                                                        type="checkbox"
                                                        name="xlsx"
                                                        checked={formData.formats.includes('xlsx')}
                                                        onChange={handleCheckboxChange}
                                                        required={selectedCheckboxCount === 0}
                                                    />
                                                    <label
                                                        className={`btn ${
                                                            formData.formats.includes('xlsx')
                                                                ? 'btn-purple'
                                                                : 'btn-grey'
                                                        }`}
                                                        htmlFor="btn-xlsx"
                                                    >
                                                        XLSX
                                                    </label>
                                                </div>
                                                <div>
                                                    <input
                                                        autoComplete="off"
                                                        id="btn-csv"
                                                        className="btn-checked btn-grey"
                                                        type="checkbox"
                                                        name="csv"
                                                        checked={formData.formats.includes('csv')}
                                                        onChange={handleCheckboxChange}
                                                        required={selectedCheckboxCount === 0}
                                                    />
                                                    <label
                                                        className={`btn ${
                                                            formData.formats.includes('csv')
                                                                ? 'btn-purple'
                                                                : 'btn-grey'
                                                        }`}
                                                        htmlFor="btn-csv"
                                                    >
                                                        CSV
                                                    </label>
                                                </div>
                                                <div>
                                                    <input
                                                        autoComplete="off"
                                                        id="btn-dbf"
                                                        className="btn-checked btn-grey"
                                                        type="checkbox"
                                                        name="dbf"
                                                        checked={formData.formats.includes('dbf')}
                                                        onChange={handleCheckboxChange}
                                                        required={selectedCheckboxCount === 0}
                                                    />
                                                    <label
                                                        className={`btn ${
                                                            formData.formats.includes('dbf')
                                                                ? 'btn-purple'
                                                                : 'btn-grey'
                                                        }`}
                                                        htmlFor="btn-dbf"
                                                    >
                                                        DBF
                                                    </label>
                                                </div>
                                            </div>
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
                                            <span key={index} className="status status-active w-100 d-flex justify-content-center">{row.id_service}</span>
                                        </td>
                                        <td className="w-0">
                                            <button
                                                type="button"
                                                className="btn btn-purple"
                                                onClick={() => handleRemoveColumn(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} size="xl" />
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
                                        className="form-control"
                                        type="text"
                                        placeholder="Введите ID платежа"
                                        value={paymentId}
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="btn btn-purple d-flex position-absolute"
                                        type="button"
                                        onClick={handleAddColumn}
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="icon-search" />
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
