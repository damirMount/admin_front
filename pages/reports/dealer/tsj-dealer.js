import React, {useState} from "react";
import ReportsNavigationTabs from "../../../components/pages/report/ReportsNavigationTabs";
import Preloader from "../../../components/main/system/Preloader";
import FormInput from "../../../components/main/input/FormInput";
import {DEALER_REPORTS_UPDATE_TSJ_DEALER_API} from "../../../routes/api";
import Head from "next/head";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import SmartTable from "../../../components/main/table/SmartTable";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";


export default function TSJDealerPage() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const formData = new FormData();
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию

    const tableColumns = [
        {
            title: 'Код*',
            dataIndex: 'code',
            ...SearchByColumn('code'),
            sorter: (a, b) => a.code - b.code,
        },
        {
            title: 'Название дилера*',
            dataIndex: 'name',
            className: 'col-10',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...SearchByColumn('name'),
        },
        {
            title: 'ФИО*',
            dataIndex: 'fio',
            sorter: (a, b) => a.fio.localeCompare(b.fio),
            ...SearchByColumn('fio'),
        },
        {
            title: 'Банк*',
            dataIndex: 'bank',
            className: 'col-2',
            sorter: (a, b) => a.bank.localeCompare(b.bank),
            ...SearchByColumn('bank'),
        },
        {
            title: 'Бик*',
            dataIndex: 'bik',
            className: 'col-2',
            sorter: (a, b) => a.bik - b.bik,
            ...SearchByColumn('bik'),
        },
        {
            title: 'Бухгалтер',
            dataIndex: 'accountant',
            sorter: (a, b) => String(a.accountant).localeCompare(String(b.accountant)),
            ...SearchByColumn('accountant'),
        },

    ];


    const handleFileUpload = (event) => {
        const fileInput = event.target.files[0];
        formData.append('dialerUploadFile', fileInput);
    };

    const handleUpdateDealer = async () => {
        try {

            const response = await fetch(DEALER_REPORTS_UPDATE_TSJ_DEALER_API, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: formData,
            });
            setProcessingLoader(true);
            const responseData = await response.json();


            if (response.ok) {
                openNotification({type: "success", message: responseData.message});
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            openNotification({type: "error", message: "Внутренняя ошибка сервера."});
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
                    <div className='mt-5'>
                        <div className="d-flex justify-content-end w-100">
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
                        </div>
                        <SmartTable
                            model='TSJDealer'
                            columns={tableColumns}
                        />
                    </div>
                )}

            </div>

        </div>
    );
}
