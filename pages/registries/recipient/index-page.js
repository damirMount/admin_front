// pages/index.js
import React from 'react';
import Head from 'next/head';
import DatabaseTable from "../../../components/main/table/DatabaseTable";
import {RECIPIENT_DELETE_API} from "../../../routes/api";
import ServiceStatusIndicator from "../../../components/main/table/cell/ServiceStatusIndicator";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {faClockRotateLeft} from "@fortawesome/free-solid-svg-icons";
import {RECIPIENT_EDIT_URL} from "../../../routes/web";
import Link from "next/link";

const IndexPage = () => {
    const createRoute = '/registries/recipient/create-recipient';

    function CreateButton() {
        return (
            <Link href={createRoute} className="btn btn-purple">Добавить запись</Link>
        );
    }

    function formatTypeValue(value) {
        let answer;
        if (value === 1) {
            answer = 'Каждый день';
        }
        if (value === 2) {
            answer = 'Раз в неделю';
        }
        if (value === 3) {
            answer = 'Раз в месяц';
        }
        if (value === 4) {
            answer = 'Каждый год';
        }
        return answer;
    }

    function countEmails(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} Почт`;
        } else if (lastDigit === 1) {
            return `${value.length} Почта`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} Почты`;
        } else {
            return `${value.length} Почт`;
        }
    }

    function RecipientTypeCell(props) {
        const type = props ? props.type || '' : '';
        const emailsCount = props ? props.emails.split(', ') || '' : '';
        return (
            <div className="col-auto action-table-buttons flex-nowrap d-flex flex-column">
                <span className="status text-start status-dashed d-flex flex-column">
                    <div>
                        <FontAwesomeIcon className="me-2" icon={faClockRotateLeft} size="lg"/>
                        {formatTypeValue((type))}
                    </div>
                    <div className="mt-1">
                        <FontAwesomeIcon className="me-2" icon={faEnvelope} size="lg"/>
                        {countEmails(emailsCount)}
                    </div>
                </span>
            </div>
        );
    }


    function StatusCell(props) {
        return (
            ServiceStatusIndicator(props.is_blocked)
        );
    }

    const tableHeaders = [
        {key: 'id', label: 'ID', isSearchable: true},
        {key: 'name', label: 'Название', isSearchable: true, headerClass: 'col-auto'},
        {key: 'is_blocked', label: 'Статус', body: StatusCell},
        {key: 'type', label: 'Тип отправки', body: RecipientTypeCell},
        {key: 'updatedAt', label: 'Дата изменения'},
        {key: 'createdAt', label: 'Дата создания'},
    ];

    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: `${RECIPIENT_EDIT_URL}`, useId: true},
        deleteRoute: {label: 'Удалить', link: `${RECIPIENT_DELETE_API}`, useId: true},
    };

    const configTable = [
        {key: 'actionButtons', links: actionButtonsLinks},
        {key: 'selectRowsPerPage'}
    ];

    return (
        <div>
            <Head>
                <title>Список получателей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Список получателей</h1>

                <div className="create-button d-flex justify-content-center">
                    <RegistryNavigationTabs/>
                </div>

                <DatabaseTable
                    model='Recipient'
                    tableHeaders={tableHeaders}
                    configTable={configTable}
                    additionalElement={CreateButton}
                />

            </div>
           
        </div>
    );
};

export default IndexPage;
