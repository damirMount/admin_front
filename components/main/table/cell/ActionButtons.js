import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis} from '@fortawesome/free-solid-svg-icons';
import DataRemover from "../../database/DataRemover";
import Link from "next/link";
import {Dropdown, Menu} from "antd";

const ActionButtons = (buttonsLinks = null, props) => {
    const id = props.id;
    const createdAt = props.createdAt;
    const updatedAt = props.updatedAt;
    const deletedAt = props.deletedAt;

    const buttons = [];

    const Item = Menu.Item

    for (const key in buttonsLinks) {
        const {label, link, useId} = buttonsLinks[key];

        if (key !== 'deleteRoute' && (id !== null && id !== undefined)) {
            const buttonLink = `${link}${useId ? `/${id}` : ''}`;
            buttons.push(
                <Item key={key}>
                    <Link href={buttonLink} className="dropdown-item d-flex align-items-center">
                        {label}
                    </Link>
                </Item>
            );
        } else if (key === 'deleteRoute' && (id !== null && id !== undefined)) {
            buttons.push(
                <Item key={key}>
                    <DataRemover id={id} deleteRoute={link}/>
                </Item>
            );
        }
    }

    const menu = (
        <Menu>
            {buttons}
            {(createdAt || updatedAt || deletedAt) && (
                <>
                    <Menu.Divider/>
                    <Item className="d-flex fw-bold flex-column text-start">
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
                    </Item>
                </>
            )}
        </Menu>
    );

    return (
        <Dropdown overlay={menu} placement="bottomRight" arrow trigger={['click']}>
            <div className="btn btn-purple p-0 ps-2 pe-2 rounded-3">
                <FontAwesomeIcon icon={faEllipsis} size="lg"/>
            </div>
        </Dropdown>
    );
};

export default ActionButtons;
