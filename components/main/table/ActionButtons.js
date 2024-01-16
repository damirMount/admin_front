import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsis} from "@fortawesome/free-solid-svg-icons";

const ActionsButtons = (editRoute, deleteRoute, id, createdAt, updatedAt, handleDeleteConfirmation) => {

    return (
        <div className="action-table-buttons col-auto w-0">
            <div className="dropdown">
                <button className="btn btn-purple p-0 ps-2 pe-2 rounded-3" type="button"
                        id="moreActionsButton"
                        data-bs-toggle="dropdown" aria-expanded="false">
                    <FontAwesomeIcon icon={faEllipsis} size="xl"/>
                </button>
                <ul className="dropdown-menu" aria-labelledby="moreActionsButton">
                    {(editRoute && id) && (
                        <li>
                            <a href={`${editRoute}/${id}`}
                               className="dropdown-item  d-flex align-items-center">
                                Изменить запись
                            </a>
                        </li>
                    )}
                    {(deleteRoute && id) && (
                        <li>
                            <button className="dropdown-item d-flex align-items-center"
                                    onClick={() => handleDeleteConfirmation(id)}>
                                Удалить
                            </button>
                        </li>
                    )}
                    {(createdAt || updatedAt) && (
                        <>
                            <li>
                                <hr className="dropdown-divider"/>
                            </li>
                            <li className="status d-flex flex-column text-start">
                                {createdAt && (
                                    <div className="d-flex flex-column justify-content-start">
                                        <span className="me-2 text-secondary">Создано:</span>
                                        <span>{createdAt}</span>
                                    </div>
                                )}
                                {updatedAt && (
                                    <div className="d-flex mt-2 flex-column justify-content-start">
                                        <span className="me-2 text-secondary">Последнее изменение:</span>
                                        <span>{updatedAt}</span>
                                    </div>
                                )}
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ActionsButtons;
