// pages/index.js
import React, {useState} from 'react';
import Head from 'next/head';
import {useAlert} from "../../contexts/AlertContext";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import SmartTable from "../../components/main/table/SmartTable";
import RegistryFileFormat from "../../components/pages/registry/RegistryFileFormat";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons";
import {TEST_DATA_UTILS_CREATE_FILE_API} from "../../routes/api";
import {useSession} from "next-auth/react";

export default function TestPage() {
    const {openNotification} = useAlert();
    const [excelFile, setExcelFile] = useState(null);
    const {data: session} = useSession(); // Получаем сессию
    const [formData, setFormData] = useState({
        formats: [],
        data: [
            {
                name: 'Mike',
                age: 32,
                address: '10 Downing Street',
            },
            {
                name: 'John',
                age: 42,
                address: '10 Street',
            },
            {
                name: 'Dilan',
                age: 12,
                address: '10 Downing Street',
            },
            {
                name: 'David',
                age: 43,
                address: '10 Downing ',
            },
        ],
    });
    const handleExcelFileChange = (e) => {
        setExcelFile(e.target.files[0]);

        const inputWrapper = e.target.closest(".input__wrapper");
        if (inputWrapper) {
            inputWrapper.classList.toggle("input__wrapper-file-selected", !!e.target.files.length);
        }
    };

    const handleCreateFile = async (event) => {

        try {

            const activeFormData = {
                ...formData,
                tableHeaders: tableColumns,
            };

            // Отправка данных формы на API
            const response = await fetch(TEST_DATA_UTILS_CREATE_FILE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(activeFormData),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const fileName = `Отчёт за.` + formData.formats[0];
                handleDownloadReport(url, fileName);
                openNotification({type: "success", message: "Отчет успешно создан."});


            } else {
                const responseData = await response.json();
                openNotification({type: "error", message: responseData.message});
            }

        } catch (error) {
            openNotification({type: "error", message: error.message});
            console.error(error);
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
    const tableColumns = [
        {
            key: 'sort',
            className: 'col-1'
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];
    return (

        <ProtectedElement allowedPermissions={'develop'}>
            <div>
                <div>
                    <Head>
                        <title>TEST ZONE | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                    </Head>
                    <div>
                        <h1>TEST ZONE</h1>
                        <div className="d-flex justify-content-between">

                            <div className='d-flex flex-column w-75 align-items-center'>
                                <div className='w-100 mb-3'>
                                    <SmartTable
                                        columns={tableColumns}
                                        data={formData.data}
                                        paginationPosition={['none']}
                                    />
                                </div>
                            </div>

                            {/*<div className='d-flex flex-column w-50 align-items-center justify-content-between'>*/}
                            {/*    <div className="input__wrapper">*/}
                            {/*        <input*/}
                            {/*            type="file"*/}
                            {/*            id="input__file-excel"*/}
                            {/*            className="input input__file"*/}
                            {/*            multiple*/}
                            {/*            onChange={handleExcelFileChange}*/}
                            {/*        />*/}
                            {/*        <label htmlFor="input__file-excel" className="input__file-button">*/}
                            {/*            <div className="d-flex flex-column w-100 justify-content-center">*/}
                            {/*                <span className="mb-3 input_icon_acquiring">*/}
                            {/*                    <FontAwesomeIcon icon={faFileExcel} size="xl"/>*/}
                            {/*                </span>*/}
                            {/*                <span className="input__file-button-text">*/}
                            {/*            {excelFile*/}
                            {/*                ? `${excelFile.name}`*/}
                            {/*                : "Выберите файл"}*/}
                            {/*        </span>*/}
                            {/*            </div>*/}
                            {/*        </label>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div className='ms-3 d-flex flex-column w-75'>
                                <div className='d-flex flex-column justify-content-around h-100'>
                                    <div>
                                    <h5>Создание файла</h5>
                                    <p>Укажите в таблице с лева все необходимые данные которые вы хотите чтобы
                                        присутствовали в созданном файле. После чего вы можете выбрать формат в котором
                                        вы хотите чтобы файл создался и нажать на кнопку Создать. Созданный файл вы
                                        сможете скачать в блоке снизу</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-end'>
                                        <RegistryFileFormat
                                            formData={formData}
                                            setFormData={setFormData}
                                            isRadioMode={true}
                                        />
                                        <bottom
                                            className="btn btn-purple mt-4"
                                            onClick={handleCreateFile}
                                        >
                                            Создать
                                        </bottom>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
};
