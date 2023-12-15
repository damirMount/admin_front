import Navigation from "../../../components/main/Navigation";
import Footer from "../../../components/main/Footer";
import React, { useEffect, useState } from "react";
import CustomSelect from "../../../components/input/CustomSelect";
import { parseCookies } from "nookies";
import Alert from "../../../components/main/Alert";
import Preloader from "../../../components/main/Preloader";
import { formatDistanceToNow } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import ReportsNavigationTabs from "../../../components/report/ReportsNavigationTabs";
import {DEALER_REPORTS_EXPORT_URL} from "../../../routes/api";
import Head from "next/head";
import DateRangeInput from "../../../components/input/DateRangeInput";


export default function IndexPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [processingLoader, setProcessingLoader] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
    const [fileDownloaded, setFileDownloaded] = useState([]);
    const [formData, setFormData] = useState({
        startDate: null,
        endDate: null,
    });

    const clearAlertMessage = () => {
        setAlertMessage({ type: "", text: "" });
    };


    const handleDateChange = (newStartDate, newEndDate) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const handleCreateReport = async () => {
        try {
            const dataToSend = {
                formData,
            };
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const sendRegistryApiUrl = `${DEALER_REPORTS_EXPORT_URL}`;

            setProcessingLoader(true);

            const response = await fetch(sendRegistryApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const createdAt = new Date();
                const fileName = `Отчёт за ${startDate} по ${endDate}.xlsx`;

                setAlertMessage({ type: "success", text: "Отчет успешно создан." });
                setFileDownloaded((prevFileDownloaded) => [...prevFileDownloaded, { fileName, startDate, endDate, created: createdAt, url }]);
                handleDownloadReport(url, fileName);

            } else {
                const responseData = await response.json();
                setAlertMessage({ type: "error", text: responseData.message });
            }
        } catch (error) {
            console.error('Ошибка при отправке реестра:', error);
            setAlertMessage({ type: "error", text: "Произошла ошибка при создании отчета" });
        } finally {
            setProcessingLoader(false);
        }
    };


    const handleDownloadReport = (url, fileName) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: startDate,
            endDate: endDate,
        }));
    }, [startDate, endDate]);

    return (
        <div>
            <Head>
                <title>Отчёты по истории счётов | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation />
            </div>
            <div>
                <Alert alertMessage={alertMessage} clearAlertMessage={clearAlertMessage} />
            </div>
            <div className="container body-container mt-5">
                <h1>Выгрузка отчета по истории счетов</h1>

                <ReportsNavigationTabs />
                {processingLoader ? (
                    <Preloader />
                ) : (
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row w-100 justify-content-center">

                            <div className="d-flex flex-column  align-items-center">
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="is_blocked">Выберите отчет</label>
                                        <CustomSelect
                                            options={[
                                                { value: '0', label: 'Проведенные платежи' }
                                            ]}
                                            selectedValue={[{ value: '0', label: 'Проведенные платежи' }]}
                                            required
                                            onSelectChange={(selectedValue) => {
                                                // setFormData((prevFormData) => ({
                                                //     ...prevFormData,
                                                //     is_blocked: selectedValue,
                                                // }));
                                            }}
                                            name="is_blocked"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="is_blocked">По времени</label>
                                        <div className="ps-3 input-form d-flex justify-content-between bg-white align-items-center">
                                            <label htmlFor="">Выберите опцию</label>
                                            <CustomSelect
                                                options={[
                                                    { value: 0, label: 'Проведения платежа' },
                                                ]}
                                                selectedValue={{ value: 0, label: 'Проведения' }}
                                                required
                                                className="selector-choice"
                                                name="isTestEmailEnabled"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="is_blocked">Дилер</label>
                                        <CustomSelect
                                            options={[
                                                { value: '0', label: 'По всем дилерам' }
                                            ]}
                                            selectedValue={[{ value: '0', label: 'По всем дилерам' }]}
                                            required
                                            onSelectChange={(selectedValue) => {
                                                // setFormData((prevFormData) => ({
                                                //     ...prevFormData,
                                                //     is_blocked: selectedValue,
                                                // }));
                                            }}
                                            name="is_blocked"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="is_blocked">Поставщик</label>
                                        <CustomSelect
                                            options={[
                                                { value: '0', label: 'По всем поставщикам' }
                                            ]}
                                            selectedValue={[{ value: '0', label: 'По всем поставщикам' }]}
                                            required
                                            onSelectChange={(selectedValue) => {
                                                // setFormData((prevFormData) => ({
                                                //     ...prevFormData,
                                                //     is_blocked: selectedValue,
                                                // }));
                                            }}
                                            name="is_blocked"
                                        />
                                    </div>


                                    <DateRangeInput
                                        initialStartDate={startDate}
                                        initialEndDate={endDate}
                                        onDateChange={handleDateChange}
                                    />

                                </div>
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-purple mt-5" onClick={handleCreateReport}>
                                        Создать отчет
                                    </button>
                                </div>
                            </div>

                            {fileDownloaded.length > 0 && (
                                <div className="mt-2 w-75 ms-5">
                                    <label htmlFor="reportsDownload" className="w-100 text-nowrap text-end ">Скачать предыдущие отчёты</label>
                                    <table id="reportsDownload" className="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th className="col-3">Название файла</th>
                                            <th className="col-auto" colSpan="2">Параметры отчёта</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {fileDownloaded.map((file, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div>
                                                        <span className="justify-content-start fs-6 flex-wrap p-0">{file.fileName}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-3 flex-column">
                                                        <span className="status status-blocked">{formatDistanceToNow(new Date(file.created),
                                                            { addSuffix: true, includeSeconds: true, locale: ruLocale  })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="d-flex flex-column me-2">
                                                            <div className="d-flex justify-content-between flex-column">
                                                                <span className="justify-content-start fs-6 flex-wrap p-0">Тип отчёта:</span>
                                                                <span className="status justify-content-start p-0 align-items-center">Проведённые платежи</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mt-3 flex-column">
                                                                <span className="justify-content-start fs-6 flex-wrap p-0">По времени:</span>
                                                                <span className="status justify-content-start p-0 align-items-center">Проведения платежа</span>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex flex-column ms-2">
                                                            <div className="d-flex justify-content-between flex-column">
                                                                <span className="justify-content-start fs-6 flex-wrap p-0">Дилер:</span>
                                                                <span className="status justify-content-start p-0 align-items-center">По всем дилерам</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mt-3 flex-column">
                                                                <span className="justify-content-start fs-6 flex-wrap p-0">Поставщик:</span>
                                                                <span className="status justify-content-start p-0 align-items-center">По всем поставщикам</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="col-1 action-table-buttons">
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className="btn btn-purple"
                                                        onClick={() => handleDownloadReport(file.url, file.fileName)}
                                                    >
                                                        Скачать
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>

                    </div>
                )}
            </div>
            <Footer></Footer>
        </div>
    );
};
