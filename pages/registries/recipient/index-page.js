// pages/index.js
import React from 'react';
import Footer from '../../../components/main/Footer';
import Head from 'next/head';
import DatabaseTable from "../../../components/main/table/DatabaseTable";
import {RECIPIENT_DELETE_URL} from "../../../routes/api";
import ServiceStatusIndicator from "../../../components/main/table/cell/ServiceStatusIndicator";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar} from "@fortawesome/free-regular-svg-icons";

const IndexPage = () => {
    const createRoute = '/registries/recipient/create-recipient';

    function CreateButton() {
        return (
            <a href={createRoute} className="btn btn-purple">Добавить запись</a>
        );
    }

    function formatTypeValue(value) {
        let answer;
        if (value === 1) {
            answer = 'Ежедневный';
        }
        if (value === 2) {
            answer = 'Еженедельный';
        }
        if (value === 3) {
            answer = 'Ежемесячный';
        }
        if (value === 4) {
            answer = 'Ежегодный';
        }
        return answer;
    }

    function RecipientTypeCell(props) {
        const type = props ? props.type || '' : '';
        return (
            <div className="col-auto action-table-buttons flex-nowrap d-flex">
                <div className="d-flex justify-content-start">
                    <FontAwesomeIcon className="me-2" icon={faCalendar} size="xl"/>
                    {formatTypeValue((type))}
                </div>
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
        editRoute: {label: 'Изменить запись', link: '/registries/recipient/edit-recipient', useId: true},
        deleteRoute: {label: 'Удалить', link: `${RECIPIENT_DELETE_URL}`, useId: true},
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
            <div className="container body-container mt-5 ">
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
            <Footer/>
        </div>
    );
};

export default IndexPage;
