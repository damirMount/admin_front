import React, { useState, useEffect } from 'react';
import { parseCookies } from 'nookies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight, faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import RegistryTabs from "./RegistryTabs";

const RegistryBackups = ({ apiUrl, downloadUrl }) => {
    const [registryFiles, setRegistryBackup] = useState([]);
    const [page, setPage] = useState(1); // Текущая страница
    const [totalPages, setTotalPages] = useState(0);
    const maxButtons = 5; // Максимальное количество отображаемых кнопок
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');


    const fetchRegistryBackup = async () => {
        // Создайте объект с параметрами запроса, включая поиск
        const queryParams = {
            page,
            search: searchTerm, // Добавьте поисковый параметр, если он есть
        };

        const queryString = new URLSearchParams(queryParams).toString(); // Преобразуйте параметры в строку

        const controllerApiUrl = `${apiUrl}?${queryString}`;
        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;

        try {
            const response = await fetch(controllerApiUrl, {
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
            setRegistryBackup(data.data);
            setTotalPages(data.last_page);
        } catch (error) {
            console.error('Error fetching registry files:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Б';
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
    };

    const formatDateTime = (dateTimeString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateTimeString).toLocaleDateString('ru-RU', options);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        // Вызываем fetchRegistryBackup с новыми параметрами поиска
        fetchRegistryBackup();
    };

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
    };

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

    useEffect(() => {
        fetchRegistryBackup();
    }, [page, searchTerm]); // Зависимость от page и searchTerm

    // Вызываем generatePaginationButtons после установки totalPages
    const paginationButtonsArr = generatePaginationButtons();

    return (
        <div>
            <div className="create-button d-flex justify-content-center mb-5">
                <RegistryTabs />
            </div>
            <div className="d-flex flex-row">
                <form onSubmit={handleSearch} className="d-flex justify-content-end">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button className="btn btn-grey d-flex position-absolute" type="submit">
                        <FontAwesomeIcon icon={faSearch} className="icon-search" />
                    </button>
                </form>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <table className="table table-bordered mt-4">
                    <thead>
                    <tr>
                        <th className="col-9">Название</th>
                        <th className="col-1">Размер</th>
                        <th className="col-2">Дата создания</th>
                        <th>Скачать</th>
                    </tr>
                    </thead>
                    <tbody>
                {Array.isArray(registryFiles) && registryFiles.length > 0 ? (
                    registryFiles.map((file) => (
                        <tr key={file.name}>
                            <td>
                                {file.name}
                            </td>
                            <td>
                                {formatFileSize(file.size)}
                            </td>
                            <td>
                                {formatDateTime(file.createdAt)}
                            </td>
                            <td>
                                <button onClick={() => handleDownload(file.name)} className="btn btn-purple ms-2">
                                    <FontAwesomeIcon icon={faDownload} size="lg" />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">Нет доступных файлов.</td>
                    </tr>
                )}
                </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-center mt-5">
                {page > 1 && (
                    <button onClick={() => handlePageChange(page - 1)} className="btn btn-grey me-3">
                        <FontAwesomeIcon icon={faAnglesLeft} /> Назад
                    </button>
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
                        Вперёд <FontAwesomeIcon icon={faAnglesRight} />{' '}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegistryBackups;
