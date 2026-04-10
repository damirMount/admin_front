import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis} from '@fortawesome/free-solid-svg-icons';
import DataRemover from '../../database/DataRemover';
import Link from 'next/link';
import {Dropdown} from 'antd';
import dayjs from "dayjs";

const ActionButtons = ({
                           buttonsLinks = {},
                           id,
                           createdAt,
                           updatedAt,
                           deletedAt,
                           dropdownOpen = false,
                           setDropdownOpen = () => {
                           },
                       }) => {

    const items = [];

    for (const [key, config] of Object.entries(buttonsLinks)) {
        if (!config) continue;

        const {label, icon, link, useId, action} = config;
        const buttonLink = `${link}${useId && id != null ? `/${id}` : ''}`;

        if (key === 'deleteRoute' && id != null) {
            items.push({
                key,
                label: <DataRemover id={id} deleteRoute={link}/>,
            });
        } else {
            const content = (
                <>
                    {icon && <FontAwesomeIcon className="me-2" icon={icon}/>}
                    {label}
                </>
            );

            items.push({
                key,
                label: action ? (
                    <button
                        className="dropdown-item d-flex align-items-center"
                        data-clickable="true"
                        onClick={() => action(id)}
                    >
                        {content}
                    </button>
                ) : (
                    <Link href={buttonLink} className="dropdown-item d-flex align-items-center" data-clickable="true">
                        {content}
                    </Link>
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
                key: 'timestamps',
                label: (
                    <div className="d-flex fw-bold flex-column text-start">
                        {createdAt && (
                            <div className="d-flex flex-column justify-content-start">
                                <small className="text-secondary">Создано:</small>
                                <small>{createdAt ? dayjs(createdAt).format("DD.MM.YY HH:mm:ss") : "-"}</small>
                            </div>
                        )}
                        {updatedAt && (
                            <div className="d-flex mt-2 flex-column justify-content-start">
                                <small className="text-secondary">Последнее изменение:</small>
                                <small>{updatedAt ? dayjs(updatedAt).format("DD.MM.YY HH:mm:ss") : "-"}</small>
                            </div>
                        )}
                        {deletedAt && (
                            <div className="d-flex mt-2 flex-column justify-content-start">
                                <small className="text-secondary">Удалено:</small>
                                <small>{deletedAt ? dayjs(deletedAt).format("DD.MM.YY HH:mm:ss") : "-"}</small>
                            </div>
                        )}
                    </div>
                ),
            }
        );
    }

    return (
        <Dropdown
            menu={{items}}
            placement="bottomRight"
            arrow
            trigger={['click']}
            open={dropdownOpen} // управление открытием
            onOpenChange={setDropdownOpen} // уведомление родителя
        >
            <div className="btn btn-purple p-0 ps-2 pe-2 rounded-3" data-clickable="true">
                <FontAwesomeIcon icon={faEllipsis} size="lg"/>
            </div>
        </Dropdown>
    );
};

export default ActionButtons;
