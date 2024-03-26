import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowRightArrowLeft, faFileExcel,} from "@fortawesome/free-solid-svg-icons";
import {ACQUIRING_COMPARISON_API} from "../../routes/api";
import Head from "next/head";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../components/main/system/ProtectedElement";

export default function IndexPage() {
    const [excelFile, setExcelFile] = useState(null);
    const [registryFile, setRegistryFile] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const {data: session} = useSession(); // Получаем сессию
    const handleExcelFileChange = (e) => {
        setExcelFile(e.target.files[0]);

        const inputWrapper = e.target.closest(".input__wrapper");
        if (inputWrapper) {
            inputWrapper.classList.toggle("input__wrapper-file-selected", !!e.target.files.length);
        }
    };

    const handleRegistryFileChange = (e) => {
        setRegistryFile(e.target.files[0]);

        const inputWrapper = e.target.closest(".input__wrapper");
        if (inputWrapper) {
            inputWrapper.classList.toggle("input__wrapper-file-selected", !!e.target.files.length);
        }
    };

    const handleCompareData = async () => {

        if (!excelFile || !registryFile) {
            alert("Please select both Excel and Registry files.");
            return;
        }

        const formData = new FormData();
        formData.append("excelFile", excelFile);
        formData.append("textFile", registryFile);


        console.log(formData)
        try {
            const response = await fetch(ACQUIRING_COMPARISON_API, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setComparisonResult(data.result);
            } else {
                console.error("Server returned an error:", response.status);
            }
        } catch (error) {
            console.error("Error comparing data:", error);
        }
    };


    return (
        <ProtectedElement allowedPermissions={'develop'}>
        <div>
            <Head>
                <title>Сверка платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>


            <div>
                <h1>Сверка платежей</h1>
                <div className="d-flex flex-column align-items-center w-100">
                    <div className="d-flex flex-row align-items-center w-100 mt-5">
                        <div className="input__wrapper">
                            <input
                                type="file"
                                id="input__file-excel"
                                className="input input__file"
                                multiple
                                onChange={handleExcelFileChange}
                            />
                            <label htmlFor="input__file-excel" className="input__file-button">
                                <div className="d-flex flex-column w-100 justify-content-center">
                                    <span className="mb-3 input_icon_acquiring">
                                        <FontAwesomeIcon icon={faFileExcel} size="xl"/>
                                    </span>
                                    <span className="input__file-button-text">
                                        {excelFile
                                            ? `Выбран файл эквайринга: ${excelFile.name}`
                                            : "Выберите файл эквайринга"}
                                    </span>
                                </div>
                            </label>
                        </div>
                        <div
                            className="h-100 d-flex icon-not-found flex-column align-items-center justify-content-center">
                            <FontAwesomeIcon icon={faArrowRightArrowLeft} size="xl"/>
                        </div>
                        <div className="input__wrapper">
                            <input
                                type="file"
                                id="input__file-registry"
                                className="input input__file"
                                multiple
                                onChange={handleRegistryFileChange}
                            />
                            <label htmlFor="input__file-registry" className="input__file-button">
                                <div className="d-flex flex-column w-100 justify-content-center">
                                    <span className="mb-3 input_icon_acquiring">
                                        <FontAwesomeIcon icon={faFileExcel} size="xl"/>
                                    </span>
                                    <span className="input__file-button-text">
                                        {registryFile
                                            ? `Выбран файл реестра: ${registryFile.name}`
                                            : "Выберите файл реестра"}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-purple fit-content text-nowrap mt-5"
                        onClick={handleCompareData}
                    >
                        Сравнить данные
                    </button>
                </div>
                {comparisonResult && (
                    <div className="mt-5">
                        {/* Вывод результата сравнения данных */}
                    </div>
                )}
            </div>
        </div>
        </ProtectedElement>
    );
}
