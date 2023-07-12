import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';

const TableWithPagination = ({ apiUrl, tableHeaders, tableValues, createRoute, editRoute, deleteRoute }) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = async () => {
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const response = await fetch(`${apiUrl}?page=${page}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            const results = data.data;
            const total_pages = data.last_page;
            setData(results);
            setTotalPages(total_pages);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
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
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };
    console.log(tableValues)
    const formatBooleanValue = (value) => {
        return value ? 'ДА' : 'НЕТ';
    };

    return (
        <div>
            <div className="create-button">
                <a href={createRoute} className="create-link">Создать</a>
            </div>

            <table className="table">
                <thead>
                <tr>
                    {tableHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    <th>Действие</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {tableValues.map((value, index) => (
                            <td key={index}>{typeof row[value] === "boolean" ? formatBooleanValue(row[value]) : row[value]}</td>
                        ))}
                        <td>
                            {editRoute && (
                                <a href={`${editRoute}/${row.id}`} className="edit-link">Изменить</a>
                            )}
                            {deleteRoute && (
                                <button onClick={() => handleDelete(row.id)} className="delete-button">Удалить</button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="pagination">
                {page > 1 && (
                    <button onClick={() => handlePageChange(page - 1)} className="pagination-button">Previous</button>
                )}
                {page < totalPages && (
                    <button onClick={() => handlePageChange(page + 1)} className="pagination-button">Next</button>
                )}
            </div>

            <style jsx>{`
              .create-button {
                margin-bottom: 10px;
              }

              .create-link,
              .edit-link,
              .delete-button,
              .pagination-button {
                display: inline-block;
                padding: 5px 10px;
                background-color: #9b9a9a;
                color: #fff;
                border: none;
                border-radius: 4px;
                text-decoration: none;
                cursor: pointer;
                margin-right: 5px;
              }

              .table {
                width: 100%;
                border-collapse: collapse;
              }

              .table th,
              .table td {
                padding: 8px;
                border: 1px solid #ccc;
              }

              .edit-link {
                background-color: #999;
              }

              .delete-button {
                background-color: #5b3f3f;
              }

              .pagination {
                margin-top: 10px;
              }
            `}</style>
        </div>
    );
};

export default TableWithPagination;