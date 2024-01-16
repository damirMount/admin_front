import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis} from '@fortawesome/free-solid-svg-icons';
import DataRemover from "../database/DataRemover";

const ActionButtons = ({buttonsLinks = null, props}) => {
    const id = props.id;
    const createdAt = props.createdAt;
    const updatedAt = props.updatedAt;
    const deletedAt = props.deletedAt;

    const buttons = [];

    for (const key in buttonsLinks) {
        const {label, link, useId} = buttonsLinks[key];

        if (key !== 'deleteRoute' && id) {
            const buttonLink = `${link}${useId ? `/${id}` : ''}`;
            buttons.push(
                <li key={key}>
                    <a
                        href={buttonLink}
                        className="dropdown-item d-flex align-items-center"
                    >
                        {label}
                    </a>
                </li>
            );
        } else if (key === 'deleteRoute' && id) {
            buttons.push(
                <li key={key}>
                    <DataRemover id={id} deleteRoute={link}/>
                </li>
            );
        }
    }

    return (
        <div className="action-table-buttons col-auto w-0">
            <div className="dropdown">
                <button
                    className="btn btn-purple p-0 ps-2 pe-2 rounded-3"
                    type="button"
                    id="moreActionsButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <FontAwesomeIcon icon={faEllipsis} size="xl"/>
                </button>
                <ul className="dropdown-menu" aria-labelledby="moreActionsButton">
                    {buttons}
                    {(createdAt || updatedAt || deletedAt) && (
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
                                {deletedAt && (
                                    <div className="d-flex mt-2 flex-column justify-content-start">
                                        <span className="me-2 text-secondary">Удалено:</span>
                                        <span>{deletedAt}</span>
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

export default ActionButtons;
