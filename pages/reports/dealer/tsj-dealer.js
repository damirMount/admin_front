import React, {useState} from "react";
import ReportsNavigationTabs from "../../../components/pages/report/ReportsNavigationTabs";
import Preloader from "../../../components/main/Preloader";
import FormInput from "../../../components/main/input/FormInput";
import {DEALER_REPORTS_UPDATE_TSJ_DEALER_API} from "../../../routes/api";
import Head from "next/head";
import {useAlert} from "../../../contexts/AlertContext";
import DatabaseTable from "../../../components/main/table/DatabaseTable";
import {useSession} from "next-auth/react";


export default function IndexPage() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const formData = new FormData();
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const { data: session } = useSession(); // Получаем сессию
    const tableHeaders = [
        {key: 'code', label: 'Код*', isSearchable: true},
        {key: 'name', label: 'Название дилера*', isSearchable: true},
        {key: 'fio', label: 'ФИО*', isSearchable: true},
        {key: 'bank', label: 'Банк*', isSearchable: true},
        {key: 'bik', label: 'Бик*', isSearchable: true},
        {key: 'accountant', label: 'Бухгалтер', isSearchable: true}
    ];

    const configTable = [
        {key: 'selectRowsPerPage'},
    ];

    function UpdateDealerList() {

        return (
            <form className="d-flex justify-content-between align-items-center align-content-center">
                <div>
                    <FormInput
                        type="file"
                        className="form-control input-search"
                        id="excelFile"
                        name="excelFile"
                        onChange={handleFileUpload}
                        required
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-purple btn-search"
                    onClick={handleUpdateDealer}
                >
                    Обновить список
                </button>
            </form>
        );
    }


    const handleFileUpload = (event) => {
        const fileInput = event.target.files[0];
        formData.append('dialerUploadFile', fileInput);
    };

    const handleUpdateDealer = async () => {
        try {

            const updateTSJDealerApiUrl = `${DEALER_REPORTS_UPDATE_TSJ_DEALER_API}`;
            const response = await fetch(updateTSJDealerApiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: formData,
            });
            setProcessingLoader(true);
            const responseData = await response.json();
            

            if (response.ok) {
                showAlertMessage({type: "success", text: responseData.message});
            } else {
                showAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showAlertMessage({type: "error", text: "Внутренняя ошибка сервера."});
        } finally {
            setProcessingLoader(false);
        }
    };

    return (
        <div>
            <Head>
                <title>Список дилеров ТСЖ | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className=" mt-5">
                <h1>Список дилеров ТСЖ</h1>
                <ReportsNavigationTabs/>

                {processingLoader ? (
                    <Preloader/>
                ) : (
                    <DatabaseTable
                        model='TSJDealer'
                        tableHeaders={tableHeaders}
                        configTable={configTable}
                        additionalElement={UpdateDealerList}
                    />
                )}

            </div>
           
        </div>
    );
}
