import React, { useState, useEffect } from "react";
import TableWithPagination from '../../../components/TableWithPagination';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import ReportsTabs from "../../../components/ReportsTabs";
import Preloader from "../../../components/Preloader";
import FormInput from "../../../components/FormInput";
import Alert from "../../../components/Alert";
import { parseCookies } from "nookies";
import {DEALER_REPORTS_GET_TSJ_DEALER_URL, DEALER_REPORTS_UPDATE_TSJ_DEALER_URL} from "../../../routes/api";
import Head from "next/head";

export default function IndexPage() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
    const [tableData, setTableData] = useState([]);
    const formData = new FormData();

    const clearAlertMessage = () => {
        setAlertMessage({ type: "", text: "" });
    };

    const fetchDataFromServer = async () => {
        try {
        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;
        const fetchDataUrl = `${DEALER_REPORTS_GET_TSJ_DEALER_URL}`;
        const response = await fetch(fetchDataUrl, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${authToken}`
            },
        });
        const data = await response.json();
        setTableData(data);
        } catch (error) {
            console.error('Error uploading file:', error);
            setAlertMessage({ type: "error", text: "Внутренняя ошибка сервера." });
        }
    };

    useEffect(() => {
        fetchDataFromServer(); // Вызовите функцию при монтировании компонента
    }, [tableData]);

    const handleFileUpload = (event) => {
        const fileInput = event.target.files[0];
        formData.append('dialerUploadFile', fileInput);
    };

    const handleUpdateDealer = async () => {
        try {
            setProcessingLoader(true);

            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const updateTSJDealerApiUrl = `${DEALER_REPORTS_UPDATE_TSJ_DEALER_URL}`;
            const response = await fetch(updateTSJDealerApiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                setAlertMessage({type: "success", text: responseData.message});
            } else {
                setAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setAlertMessage({ type: "error", text: "Внутренняя ошибка сервера." });
        } finally {
            setProcessingLoader(false);
            fetchDataFromServer();
        }
    };

    return (
        <div>
            <Head>
                <title>Список диллеров ТСЖ| {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <Navigation />
            <Alert alertMessage={alertMessage} clearAlertMessage={clearAlertMessage} />
            <div className="container body-container mt-5">
                <h1>Список дилеров ТСЖ</h1>
                <ReportsTabs />

                {processingLoader ? (
                    <Preloader />
                ) : (
                    <div>
                        <div className="w-100">
                            <form className="d-flex justify-content-between align-items-center align-content-center mb-4">
                                <div className="form-group">
                                    <FormInput
                                        type="file"
                                        className="form-control"
                                        id="excelFile"
                                        name="excelFile"
                                        onChange={handleFileUpload}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-purple btn-"
                                    onClick={handleUpdateDealer}
                                >
                                    Обновить список дилеров ТСЖ
                                </button>
                            </form>
                        </div>

                        <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th>Код*</th>
                                <th>Название дилера*</th>
                                <th>ФИО*</th>
                                <th>Банк*</th>
                                <th>Бик*</th>
                                <th>Бухгалтер</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.code}</td>
                                    <td>{row.name}</td>
                                    <td>{row.fio}</td>
                                    <td>{row.bank}</td>
                                    <td>{row.bik}</td>
                                    <td>{row.accountant}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
