// pages/index.js
import React, {useEffect, useState} from 'react';
import Footer from '../components/main/Footer';
import Head from 'next/head';
import DatabaseTable from "../components/main/table/DatabaseTable";
import {REGISTRY_DELETE_URL} from "../routes/api";
import ServiceStatusIndicator from "../components/main/table/cell/ServiceStatusIndicator";
import UniversalSelect from "../components/main/input/UniversalSelect";

const IndexPage = () => {
    const createRoute = '/registries/registry/create-registry';

    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
    });

    function countServices(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} СЕРВИСОВ`;
        } else if (lastDigit === 1) {
            return `${value.length} СЕРВИС`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} СЕРВИСА`;
        } else {
            return `${value.length} СЕРВИСОВ`;
        }
    }

    function CreateButton() {
        return (
            <a href={createRoute} className="btn btn-purple">Добавить запись</a>
        );
    }

    function RegistryFormatCell(props) {
        const formats = props ? props.formats || [] : [];

        return (
            <div className="col-auto action-table-buttons flex-nowrap d-flex">
                {formats.map((format, index) => (
                    <span key={index} className="status  status-formats ms-1 me-1">{`${format}`}</span>
                ))}
            </div>
        );
    }

    function ServerCell(props) {
        const serverId = props ? props.server_id || '' : '';
        const services = props ? props.services_id || '' : '';

        return (
            <div className="col-auto action-table-buttons flex-nowrap d-flex">
                <span className="status status-dashed">
                    ID {`${serverId}`}
                    <br/>
                    {`${countServices(services)}`}
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
        {key: 'server_id', label: 'Сервер', body: ServerCell, isSearchable: true},
        {key: 'formats', label: 'Формат', body: RegistryFormatCell},
        {key: 'updatedAt', label: 'Дата изменения'},
        {key: 'createdAt', label: 'Дата создания'},
    ];
    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: '/registries/registry/edit-registry', useId: true},
        deleteRoute: {label: 'Удалить', link: `${REGISTRY_DELETE_URL}`, useId: true},
    };

    const configTable = [
        {key: 'actionButtons', links: actionButtonsLinks},
        {key: 'selectRowsPerPage'},
    ];
    // actionButtons
    // headerFixed
    // rowsCount
    // columnSelect
    // columnVisible
    // columnOrder
    // rowSelect
    // rowOrder
    // rowsPerPage

    const options = [
        { value: '11001', label: 'Выбрать все записи', isSelectOne: true},
        { value: 'strawberry', label: 'Strawberry'},
        { value: 'vanilla', label: 'Vanilla' }
    ]


    const fetchDataConfig = {
        model: 'Service',
        // searchTerm: {is_blocked: false, accurateSearch: true},
    };

    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };


    return (
        <div>
            <Head>
                <title>TEST ZONE | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container body-container mt-5 ">
                <h1>TEST ZONE</h1>
                <UniversalSelect
                    name='name1'
                    selectedOptions ={[4557]}
                    firstOptionSelected
                    onSelectChange={handleSelectorChange}
                    fetchDataConfig={fetchDataConfig}
                    // options={options}
                    // isMulti
                    isSearchable
                />
                <DatabaseTable
                    model='Registry'
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
