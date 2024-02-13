import Table from "./Table";
import Pagination from "../Pagination";
import React, {useEffect, useState} from "react";
import fetchData from "../database/DataFetcher";
import SearchInput from "../input/SearchInput";
import Preloader from "../Preloader";
import {useAlert} from "../../../contexts/AlertContext";
import UniversalSelect from "../input/UniversalSelect";

const DatabaseTable = ({model, tableHeaders, configTable = null, additionalElement}) => {
    const [processingLoader, setProcessingLoader] = useState(false);
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const [dataFromDB, setDataFromDB] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [totalRecords, SetTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    let [selectRowsPerPage, setSelectRowsPerPage] = useState(null);

    useEffect(() => {

        if (configTable) {
            setSelectRowsPerPage(configTable.find(item => item.key === 'selectRowsPerPage'));
        }

    }, [configTable]);

    const fetchDataFromDB = async () => {

        let loadingTimeout;
        const searchObject = {};

        tableHeaders
            .filter(column => column.isSearchable)
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

            const fetchDBConfig = {
                model: model,
                filters: searchObject,
                sort: JSON.stringify(sortColumn),
                limit: pageSize,
                offset: (page - 1) * pageSize
            };

            const response = await fetchData(fetchDBConfig);

            const {count, data} = response;
            setDataFromDB(data);
            setTotalPages(Math.ceil(count / pageSize));
            SetTotalRecords(count)
        } catch (error) {
            showAlertMessage({
                type: 'error', text: 'Ошибка при получении данных: ' + error.message,
            });
        } finally {
            clearTimeout(loadingTimeout);
            setProcessingLoader(false);
        }
    };

    useEffect(() => {
        const fetchDataAfterUpdate = async () => {
            await fetchDataFromDB();
        };

        fetchDataAfterUpdate();
    }, [page, searchTerm, sortColumn, pageSize]);

    const handlePageChange = async (newPage) => {
        setPage(newPage);
    };

    const handleSort = (sortConfig) => {
        setPage(1);
        setSortColumn((prevSortConfig) => ({
            column: sortConfig.column, direction: sortConfig.direction, count: prevSortConfig.count + 1,
        }));
    };

    const handleSearchSubmit = async (search) => {
        setSearchTerm(search);
        setPage(1);
    };

    const handleRowsPerPage = (selectedValue) => {
        const newTotalPages = (Math.ceil(totalRecords / selectedValue));

        if (page > newTotalPages) {
            setPage(newTotalPages)
        }

        setPageSize(selectedValue);
    };

    return (
        <div>
            <div className="create-button d-flex justify-content-between align-items-end mb-3">
                <div className="d-flex flex-row mt-5">
                    {tableHeaders && tableHeaders.filter(column => column.isSearchable).length > 0 && (
                        <SearchInput onSearchSubmit={handleSearchSubmit}/>
                    )}
                </div>
                <div className="d-flex flex-row mt-5">
                    {additionalElement && (
                        additionalElement()
                    )}
                </div>
            </div>
            {processingLoader ? (
                <Preloader/>
            ) : (
                <div>
                    <Table
                        data={dataFromDB}
                        tableHeaders={tableHeaders}
                        configTable={configTable}
                        onSort={handleSort}
                    />

                    {(selectRowsPerPage && totalRecords > 0) && (
                        <div className="d-flex justify-content-between align-items-end w-100 mt-2">

                            <div className="d-flex flex-column">
                                <small>Всего записей: <b>{totalRecords}</b></small>
                                <small className="me-3">На странице: <b>{dataFromDB.length}</b></small>
                            </div>

                            <div className="d-flex align-items-center">
                                <small className="me-3">Показать:</small>
                                <UniversalSelect
                                    firstOptionSelected
                                    onSelectChange={handleRowsPerPage}
                                    options={[
                                        {value: 50, label: '50 записей'},
                                        {value: 75, label: '75 записей'},
                                        {value: 100, label: '100 записей'},
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange}/>

                </div>
            )}
        </div>
    );
}

export default DatabaseTable;
