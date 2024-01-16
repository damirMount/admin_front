import Table from "./Table";
import Pagination from "../Pagination";
import React, { useEffect, useImperativeHandle, useState, useRef } from "react";
import fetchData from "../DataFetcher";
import SearchInput from "../../input/SearchInput";
import Preloader from "../Preloader";


// eslint-disable-next-line react/display-name
const DatabaseTable = React.forwardRef(({ model, columnHeaders, addedButton }, ref) => {
    const [processingLoader, setProcessingLoader] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
    const [dataFromDB, setDataFromDB] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const pageSize = 50;

    const fetchDataFromDBRef = useRef();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchDataFromDB = async () => {
        let loadingTimeout;

        const searchObject = {};

        columnHeaders
            .filter(column => column.searchable)
            .forEach(column => {
                const searchValue = searchTerm;
                if (searchValue !== undefined && searchValue !== '') {
                    searchObject[column.key] = searchValue;
                }
            });

        try {
            loadingTimeout = setTimeout(() => {
                setProcessingLoader(true);
            }, 1000);

            const response = await fetchData(
                model,
                searchObject,
                null,
                JSON.stringify(sortColumn),
                pageSize,
                (page - 1) * pageSize,
                setAlertMessage
            );

            const { count, data } = response;
            setDataFromDB(data);
            setTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            setAlertMessage({
                type: 'error', text: 'Ошибка при получении данных: ' + error.message,
            });
        } finally {
            clearTimeout(loadingTimeout);
            setProcessingLoader(false);
        }
    };

    useEffect(() => {
        fetchDataFromDBRef.current = fetchDataFromDB;
    }, [fetchDataFromDB]);

    const handlePageChange = async (newPage) => {
        setPage(newPage);
        await fetchDataFromDBRef.current();
    };

    const handleSort = (sortConfig) => {
        setPage(1);
        setSortColumn((prevSortConfig) => ({
            column: sortConfig.column, direction: sortConfig.direction, count: prevSortConfig.count + 1,
        }));
        fetchDataFromDBRef.current();
    };

    const handleSearchSubmit = async (search) => {
        setSearchTerm(search);
        setPage(1);
        await fetchDataFromDBRef.current();
    };

    useEffect(() => {
        fetchDataFromDBRef.current();
    }, [page, searchTerm, sortColumn]);

    useImperativeHandle(ref, () => ({
        fetchDataFromDB: fetchDataFromDBRef.current,
    }));

    return (
        <div>
            <div className="create-button d-flex justify-content-between align-items-end mb-3">
                <div className="d-flex flex-row mt-5">
                    {columnHeaders && columnHeaders.filter(column => column.searchable).length > 0 && (
                        <SearchInput onSearchSubmit={handleSearchSubmit}/>
                    )}
                </div>
                <div className="d-flex flex-row mt-5">
                    {addedButton && (
                        addedButton()
                    )}
                </div>
            </div>
            {processingLoader ? (
                <Preloader/>
            ) : (
                <div>
                    <Table data={dataFromDB} columnHeaders={columnHeaders} onSort={handleSort}/>
                    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    );
});

export default DatabaseTable;
