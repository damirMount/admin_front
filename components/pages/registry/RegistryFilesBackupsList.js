import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import RegistryNavigationTabs from "./RegistryNavigationTabs";
import {useSession} from "next-auth/react";
import SmartTable from "../../main/table/SmartTable";
import FormatFileSize from "../../main/table/cell/FormatFileSize";
import SearchByColumn from "../../main/table/cell/SearchByColumn";

const RegistryFiles = ({apiUrl, downloadUrl}) => {
    const [registryFiles, setRegistryFile] = useState([]);
    const {data: session} = useSession(); // Получаем сессию

    const fetchRegistryFile = async () => {
        try {
            const response = await fetch(`${apiUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setRegistryFile(data.data);
        } catch (error) {
            console.error('Error fetching registry files:', error);
        }
    };


    const handleDownload = async (filename) => {
        try {
            const response = await fetch(`${downloadUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({filename}),
            });
            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }

            // Получите Blob (бинарные данные файла)
            const blob = await response.blob();

            // Создайте объект URL для Blob
            const blobUrl = URL.createObjectURL(blob);

            // Создайте ссылку для скачивания
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Очистите объект URL
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };


    useEffect(() => {
        fetchRegistryFile();
    }, []); // Зависимость от page и searchTerm


    const tableColumns = [
        {
            title: 'Название',
            dataIndex: 'name',
            className: 'col-10',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...SearchByColumn('name'),
        },
        {
            title: 'Размер',
            dataIndex: 'size',
            render: (text) => FormatFileSize(text),
            sorter: (a, b) => a.size - b.size,
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            sorter: (a, b) => a.createdAt - b.createdAt,
            ...SearchByColumn('createdAt'),
        },
        {
            title: 'Скачать',
            render: (text, record) => <button onClick={() => handleDownload(record.name)}
                                              className="btn btn-purple ms-2">
                <FontAwesomeIcon icon={faDownload} size="lg"/>
            </button>,
        },
    ];

    return (
        <div>
            <div className="create-button d-flex justify-content-center mb-5">
                <RegistryNavigationTabs/>
            </div>
            <div>
                <SmartTable data={registryFiles} columns={tableColumns}/>
            </div>
        </div>
    );
};

export default RegistryFiles;
