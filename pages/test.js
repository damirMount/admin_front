// IndexPage.jsx
import React, { useState, useEffect } from 'react';
import Navigation from '../components/main/Navigation';
import Footer from '../components/main/Footer';
import Preloader from '../components/main/Preloader';
import Alert from '../components/main/Alert';
import Head from 'next/head';
import fetchData from '../components/main/DataFetcher';
import Pagination from '../components/main/Pagination';
import SearchInput from "../components/input/SearchInput";
import useSortableData from '../components/input/SortableTable';

const columnHeaders = [
    { key: 'code', label: 'Код*' },
    { key: 'name', label: 'Название дилера*' },
    { key: 'fio', label: 'ФИО*' },
    { key: 'bank', label: 'Банк*' },
    { key: 'bik', label: 'Бик*' },
    { key: 'accountant', label: 'Бухгалтер' },
];

const IndexPage = () => {
    const [processingLoader, setProcessingLoader] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [dataFromDB, setDataFromDB] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 50;

    const clearAlertMessage = () => {
        setAlertMessage({ type: '', text: '' });
    };

    const fetchDataFromDB = async (newPage, term) => {
        try {
            // setProcessingLoader(true);
            const response = await fetchData(
                'TSJDealer',
                term,
                null,
                null,
                pageSize,
                (newPage - 1) * pageSize,
                setAlertMessage);
            const { count, data } = response;
            setDataFromDB(data);
            setPage(newPage);
            setTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            setAlertMessage({
                type: 'error',
                text: 'Ошибка при получении данных: ' + error.message,
            });
        } finally {
            setProcessingLoader(false);
        }
    };

    const handlePageChange = async (newPage) => {
        await fetchDataFromDB(newPage, searchTerm);
    };

    const handleSearchSubmit = async (term) => {
        setSearchTerm(term);
        const setFistPage = 1;
        
        setPage(setFistPage)
        await fetchDataFromDB(setFistPage, term);
    };

    const { items: sortedData, requestSort, sortConfig } = useSortableData(dataFromDB);

    useEffect(() => {
        fetchDataFromDB(page, searchTerm);
    }, [page, searchTerm]);

    const renderColumnHeaders = () => (
        <tr>
            {columnHeaders.map(({ key, label }) => (
                <th key={key} className="table-sort-button" onClick={() => requestSort(key)}>
                    <div className="w-100 d-flex justify-content-between flex-nowrap">
                    {label}
                    {sortConfig && sortConfig.key === key && (
                        <span >{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                    </div>
                </th>
            ))}
        </tr>
    );

    return (
        <div>
            <Head>
                <title>TEST ZONE | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <Navigation />
            <div className="container body-container mt-5 ">
                <h1>TEST ZONE</h1>
                <div className="create-button d-flex justify-content-between mb-3">
                    <div className="d-flex flex-row mt-5">
                        <SearchInput onSearchSubmit={handleSearchSubmit} />
                    </div>
                </div>
                <Alert alertMessage={alertMessage} clearAlertMessage={clearAlertMessage} />
                {processingLoader ? (
                    <Preloader />
                ) : (
                    <div>
                        <table className="table table-bordered">
                            <thead>
                            {renderColumnHeaders()}
                            </thead>
                            {sortedData && sortedData.length > 0 ? (
                                <tbody>
                                {sortedData.map((row, index) => (
                                    <tr key={index}>
                                        {columnHeaders.map(({ key }) => (
                                            <td key={key}>{row[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            ) : (
                                <tbody>
                                <tr>
                                    <td colSpan={columnHeaders.length} className="text-center">
                                        Нет данных
                                    </td>
                                </tr>
                                </tbody>
                            )}
                        </table>
                        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default IndexPage;
