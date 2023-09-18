import React, { useState, useEffect } from 'react';
import { parseCookies } from 'nookies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight, faDownload } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";

const RegistryBackups = () => {
    const [logFiles, setRegistryBackup] = useState([]);
    const downloadUrl = 'http://localhost:3001/api/registryBackup/download';
    const [page, setPage] = useState(1); // Текущая страница
    const [totalPages, setTotalPages] = useState(0);
    const maxButtons = 5; // Максимальное количество отображаемых кнопок
    const router = useRouter();

    useEffect(() => {
        const fetchRegistryBackup = async () => {
            const apiUrl = `http://localhost:3001/api/registryBackup/index?page=${page}`;
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data)
                setRegistryBackup(data.data);
                setTotalPages(data.last_page);
            } catch (error) {
                console.error('Error fetching log files:', error);
            }
        };


        fetchRegistryBackup();
    }, [page]); // Зависимость от page

    const handleDownload = async (filename) => {
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const response = await fetch(`${downloadUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ filename }),
            });
            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }

            // Получите Blob (бинарные данные файла)
            const blob = await response.blob();

            // Создайте объект URL для Blob
            const blobUrl = URL.createObjectURL(blob);

            // Создайте ссылку для скачивания
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Очистите объект URL
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }

    const handlePageChange = async (newPage) => {
        setPage(newPage); // Обновляем текущую страницу
    };

    const generatePaginationButtons = () => {
        const buttons = [];
        const half = Math.floor(maxButtons / 2);

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - half && i <= page + half)) {
                buttons.push(i);
            }
        }

        const paginationButtonsArr = [];
        let lastButton = 0;

        buttons.forEach((button) => {
            if (button - lastButton === 2) {
                paginationButtonsArr.push('...');
            } else if (button - lastButton !== 1) {
                paginationButtonsArr.push('...');
            }
            paginationButtonsArr.push(button);
            lastButton = button;
        });

        return paginationButtonsArr;
    };

    // Вызываем generatePaginationButtons после установки totalPages
    const paginationButtonsArr = generatePaginationButtons();

    return (
        <div>
            <div className="create-button d-flex justify-content-center mb-5">
                <Link href="/registries/recipient/index-page" className={`btn ${router.pathname === '/registries/recipient/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Получатели
                </Link>
                <Link href="/registries/registry/index-page" className={`btn ${router.pathname === '/registries/registry/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Реестры
                </Link>
                <Link href="/registries/backup/index-page" className={`btn ${router.pathname === '/registries/backup/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Резервные копии
                </Link>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <table className="table w-50 table-bordered mt-4">
                    <thead>
                    <tr>
                        <th className="col-12">Название</th>
                        <th>Скачать</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.isArray(logFiles) && logFiles.length > 0 ? (
                        logFiles.map((file) => (
                            <tr key={file}>
                                <td>
                                    {file}
                                </td>
                                <td>
                                    <button onClick={() => handleDownload(file)} className="btn btn-purple ms-2">
                                        <FontAwesomeIcon icon={faDownload} size="lg" /></button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td>No log files available.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-center mt-5">
                {page > 1 && (
                    <button onClick={() => handlePageChange(page - 1)} className="btn btn-grey me-3">
                        <FontAwesomeIcon icon={faAnglesLeft} /> Назад</button>
                )}
                {paginationButtonsArr.map((button, index) => (
                    <React.Fragment key={index}>
                        {button === '...' ? (
                            <span className="mx-1 align-self-end">...</span>
                        ) : (
                            <button onClick={() => handlePageChange(button)} className={`ms-1 me-1 btn ${button === page ? 'btn-purple' : 'btn-grey'}`}>
                                {button}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                {page < totalPages && (
                    <button onClick={() => handlePageChange(page + 1)} className="btn btn-grey ms-3">
                        Вперёд <FontAwesomeIcon icon={faAnglesRight} /> </button>
                )}
            </div>
        </div>
    );
};

export default RegistryBackups;
