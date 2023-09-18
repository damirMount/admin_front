import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faSearch, faFileCircleXmark, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';
import { useRouter } from "next/router";

const TableWithPagination = ({ apiUrl, tableHeaders, tableValues, createRoute, editRoute, deleteRoute }) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [showMessage, setShowMessage] = useState(false); // Добавляем состояние showMessage
    const maxButtons = 5; // Максимальное количество отображаемых кнопок
    const router = useRouter();

    const fetchData = async (newPage = page) => {
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const params = new URLSearchParams({
                page: newPage,
                search: searchTerm
            });
            const response = await fetch(`${apiUrl}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const responseData = await response.json();
            const results = responseData.data;
            const total_pages = responseData.last_page;

            if (Array.isArray(results) && results.length > 0) {
                setShowMessage(false);
                setData(results);
                setTotalPages(total_pages);
            } else {
                setShowMessage(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setShowMessage(true);
        }
    };




    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const handleSort = (key) => {
        let direction = 'ascending';

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else {
                key = null;
            }
        }

        setSortConfig({ key, direction });
    };

    useEffect(() => {
        fetchData();
    }, [page, sortConfig]);

    const handlePageChange = async (newPage) => {
        await fetchData(newPage);
        setPage(newPage);
    };


    const handleDeleteConfirmation = (id) => {
        setRowToDelete(id);
        setShowModal(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleDelete = async (id) => {
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            await fetch(`${deleteRoute}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setShowModal(false);
            setRowToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };

    const formatBooleanValue = (value) => {
        return value ? 'ОТКЛЮЧЁН' : 'АКТИВЕН';
    };

    function countServices(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} СЕРВИСОВ`;
        } else if (lastDigit === 1) {
            return `${value.length} СЕРВИС`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} СЕРВИСА`;
        } else {
            return `${value.length} СЕРВИСОВ`;
        }
    }

    const sortedData = data.slice().sort((a, b) => {
        if (sortConfig.key && a.hasOwnProperty(sortConfig.key) && b.hasOwnProperty(sortConfig.key)) {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (typeof valA !== 'string') {
                valA = String(valA);
            }

            if (typeof valB !== 'string') {
                valB = String(valB);
            }

            const comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base', numeric: true });

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }
        return 0;
    });

    function formatTypeValue(value) {
        let answer;
        if (value === 1){
            answer = 'Ежедневный';
        }
        if (value === 2){
            answer = 'Еженедельный';
        }
        if (value === 3){
            answer = 'Ежемесячный';
        }
        if (value === 4){
            answer = 'Ежегодный';
        }
        return answer;
    }

    const generatePaginationButtons = () => {
        const buttons = [];
        const half = Math.floor(maxButtons / 2);

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - half && i <= page + half)) {
                buttons.push(i);
            }
        }

        const paginationButtons = [];
        let lastButton = 0;

        buttons.forEach((button) => {
            if (button - lastButton === 2) {
                paginationButtons.push('...');
            } else if (button - lastButton !== 1) {
                paginationButtons.push('...');
            }
            paginationButtons.push(button);
            lastButton = button;
        });

        return paginationButtons;
    };

    const paginationButtons = generatePaginationButtons();

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
            <div className="create-button d-flex justify-content-between">
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
                <a href={createRoute} className="btn btn-purple">Создать запись</a>
            </div>

            {showMessage ? (
                <div className="d-flex justify-content-center mt-5">
                    <div className="d-flex align-items-center flex-column">
                        <div className="error-header">
                            <h5 className="m-0">ОШИБКА!</h5>
                        </div>
                        <div className="error">
                            <div className="error-content">
                                <FontAwesomeIcon icon={faFileCircleXmark} className="icon-not-found mb-3" />
                                <h5>Данные отсутствуют!</h5>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <table className="table table-bordered mt-4">
                    <thead>
                    <tr>
                        {tableHeaders.map((header, index) => (
                            <th className="table-sort-button" key={index} onClick={() => handleSort(tableValues[index])}>
                                {header}
                                {sortConfig.key === tableValues[index] && (
                                    <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                                )}
                                {sortConfig.key !== tableValues[index] && (
                                    <span> </span>
                                )}
                            </th>
                        ))}
                        <th>Действие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index}>
                            {tableValues.map((value, index) => (
                                <React.Fragment key={index}>
                                    {value === "id" && <td className="col">{row[value]}</td>}
                                    {value === "name" && <td className="col-8">{row[value]}</td>}
                                    {value === "formats" && (
                                        <td className="col-auto">
                                            {row[value].map((format, index) => (
                                                <span key={index} className="status status-formats ms-1 me-1">{format}</span>
                                            ))}
                                        </td>
                                    )}
                                    {value === "server_id" && <td className="col-1">
                                        <span className="status status-blocked">{row[value]}
                                    </span>
                                    </td>}
                                    {value === "services_id" && <td className="col-1">
                                        <span className="status status-blocked">{countServices(row[value])}
                                    </span>
                                    </td>}
                                    {value === "type" && <td className="col-1">
                                        <div className="d-flex justify-content-start">
                                            <FontAwesomeIcon className="me-2" icon={faCalendar} size="xl" />
                                            {formatTypeValue(row[value])}
                                        </div>
                                    </td>}
                                    {value === "is_blocked" && <td className="col-1">
                                        <span className={`status ${formatBooleanValue(row[value]) === 'АКТИВЕН' ? 'status-active' : 'status-blocked'}`}>{formatBooleanValue(row[value])}
                                    </span>
                                    </td>}
                                </React.Fragment>
                            ))}
                            <td className="action-table-buttons">
                                {editRoute && (
                                    <a href={`${editRoute}/${row.id}`} className="btn btn-purple me-2"><FontAwesomeIcon icon={faPenToSquare} size="xl" /></a>
                                )}
                                {deleteRoute && (
                                    <button onClick={() => handleDeleteConfirmation(row.id)} className="btn btn-purple ms-2"><FontAwesomeIcon icon={faTrashAlt} size="xl" /></button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <div className="d-flex justify-content-center mt-5">
                {page > 1 && (
                    <button onClick={async () => await handlePageChange(page - 1)} className="btn btn-grey me-3">
                        <FontAwesomeIcon icon={faAnglesLeft} /> Назад</button>
                )}
                {paginationButtons.map((button, index) => (
                    <React.Fragment key={index}>
                        {button === '...' ? (
                            <span className="mx-1 align-self-end">...</span>
                        ) : (
                            <button onClick={async () => await handlePageChange(button)} className={`ms-1 me-1 btn ${button === page ? 'btn-purple' : 'btn-grey'}`}>
                                {button}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                {page < totalPages && (
                    <button onClick={async () => await handlePageChange(page + 1)} className="btn btn-grey ms-3">
                        Вперёд <FontAwesomeIcon icon={faAnglesRight} /> </button>
                )}
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="delete-modal modal-dialog">
                        <div className="modal-content">
                            <h4>Вы уверены, что хотите удалить запись?</h4>
                            <p className="mt-2">Удалённую запись нельзя будет восстановить. <br /> Вы уверены что хотите продолжить?</p>
                            <div className="d-flex justify-content-end border-top">
                                <div className="mt-2">
                                    <button
                                        className="btn btn-purple me-2"
                                        onClick={() => handleDelete(rowToDelete)}>Удалить</button>
                                    <button
                                        className="btn btn-cancel ms-2"
                                        onClick={() => setShowModal(false)}>Отмена</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableWithPagination;
