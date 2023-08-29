import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';

const TableWithPagination = ({ apiUrl, tableHeaders, tableValues, createRoute, editRoute, deleteRoute }) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

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

    const handleDeleteConfirmation = (id) => {
        setRowToDelete(id);
        setShowModal(true);
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
    console.log(tableValues)
    const formatBooleanValue = (value) => {
        return value ? 'ОТКЛЮЧЁН' : 'АКТИВЕН';
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
                                <button onClick={() => handleDeleteConfirmation(row.id)} className="delete-button">Удалить</button>
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
            {showModal && (
                <div className="modal-overlay">
                    <div className="delete-modal">
                        <p>Вы уверены, что хотите удалить?</p>
                        <button onClick={() => handleDelete(rowToDelete)}>Да</button>
                        <button onClick={() => setShowModal(false)}>Отмена</button>
                    </div>
                </div>
            )}

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
              .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
              }

              .delete-modal {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .pagination {
                margin-top: 10px;
              }
            `}</style>
        </div>
    );
};

export default TableWithPagination;