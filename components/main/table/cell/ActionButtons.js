import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis} from '@fortawesome/free-solid-svg-icons';
import DataRemover from "../../database/DataRemover";
import Link from "next/link";
import {Dropdown} from "antd";

const ActionButtons = (buttonsLinks = null, props) => {
    const {id, createdAt, updatedAt, deletedAt} = props;
    const items = [];

    for (const key in buttonsLinks) {
        const {label, link, useId, action} = buttonsLinks[key];

        if (key !== 'deleteRoute') {
            const buttonLink = `${link}${useId && (id !== null && id !== undefined) ? `/${id}` : ''}`;
            items.push({
                key: key,
                label: (
                    <div className="dropdown-item d-flex align-items-center" data-clickable="true">
                        {link && (
                            <Link href={buttonLink} className="dropdown-item" data-clickable="true">
                                {label}
                            </Link>
                        )}
                        {action && (
                            <button className="dropdown-item" data-clickable="true">
                                {label}
                            </button>
                        )}
                    </div>
                ),
            });
        } else if (key === 'deleteRoute' && (id !== null && id !== undefined)) {
            items.push({
                key: key,
                label: (
                    <div data-clickable="true">
                        <DataRemover id={id} deleteRoute={link}/>
                    </div>
                ),
            });
        }
    }

    if (createdAt || updatedAt || deletedAt) {
        items.push(
            {
                key: 'divider',
                type: 'divider',
            },
            {
                className: 'd-flex fw-bold flex-column text-start',
                key: 'label',
                label: (
                    <div>
                        {createdAt && (
                            <div className="d-flex flex-column justify-content-start">
                                <small className="text-secondary">Создано:</small>
                                <small>{createdAt}</small>
                            </div>
                        )}
                        {updatedAt && (
                            <div className="d-flex mt-2 flex-column justify-content-start">
                                <small className="text-secondary">Последнее изменение:</small>
                                <small>{updatedAt}</small>
                            </div>
                        )}
                        {deletedAt && (
                            <div className="d-flex mt-2 flex-column justify-content-start">
                                <small className="text-secondary">Удалено:</small>
                                <small>{deletedAt}</small>
                            </div>
                        )}
                    </div>
                ),
            }
        );
    }

    return (
        <Dropdown menu={{items}} placement="bottomRight" arrow trigger={['click']}>
            <div className="btn btn-purple p-0 ps-2 pe-2 rounded-3" data-clickable="true">
                <FontAwesomeIcon icon={faEllipsis} size="lg"/>
            </div>
        </Dropdown>
    );
};

export default ActionButtons;
