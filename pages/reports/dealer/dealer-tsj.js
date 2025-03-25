import React, {useEffect, useMemo, useState} from "react";
import ReportsNavigationTabs from "../../../components/pages/report/ReportsNavigationTabs";
import Preloader from "../../../components/main/system/Preloader";
import {DEALER_REPORTS_UPDATE_TSJ_DEALER_API, READ_ABONENT_SERVICE_DB_FILE_API} from "../../../routes/api";
import Head from "next/head";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import {faAddressCard, faCompass, faCreditCard} from "@fortawesome/free-regular-svg-icons";
import {
    faBank,
    faCircleExclamation,
    faHashtag,
    faIdCardClip,
    faMoneyCheckDollar,
    faPassport,
    faPhone,
    faTag
} from "@fortawesome/free-solid-svg-icons";
import {Alert, Button, Select, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import UploadInput from "../../../components/main/input/UploadInput";
import SmartTable from "../../../components/main/table/SmartTable";

const {Text, Title} = Typography;

export default function TSJDealerPage() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const [uploadedFile, setUploadedFile] = useState([]);
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [dataTable, setDataTable] = useState([])
    const [tableFields, setTableFields] = useState({
        headers: [
            {
                key: "0",
                type: "code"
            },
            {
                key: "1",
                type: "name"
            },
            {
                key: "2",
                type: "address"
            },
            {
                key: "3",
                type: "fio"
            },
            {
                key: "4",
                type: "inn"
            },
            {
                key: "5",
                type: "okpo"
            },
            {
                key: "6",
                type: "bank"
            },
            {
                key: "7",
                type: "bik"
            },
            {
                key: "8",
                type: "bank_account"
            },
            {
                key: "9",
                type: "accountant"
            }
        ]
    });

    const activeColumns = useMemo(() => {
        return tableFields.headers.reduce((acc, header) => {
            acc[header.key] = header.type;
            return acc;
        }, {});
    }, [tableFields]);

    const handleHeaderChange = (colName, value) => {
        setTableFields(prev => {
            // Обновляем или добавляем заголовок для текущей колонки
            let headers = prev.headers.filter(
                header => !(header.key !== colName.toString() && header.type === value)
            );
            if (value === undefined || value === "") {
                headers = headers.filter(header => header.key !== colName.toString());
            } else {
                const index = headers.findIndex(header => header.key === colName.toString());
                if (index !== -1) {
                    headers = headers.map(header =>
                        header.key === colName.toString() ? {...header, type: value} : header
                    );
                } else {
                    headers = [...headers, {key: colName.toString(), type: value}];
                }
            }

            return {...prev, headers};
        });
    };

    const listSelectors = [
        {
            label: 'Код',
            value: 'code',
            icon: faHashtag,
            style: 'bg-purple'
        },
        {
            label: 'Название',
            value: 'name',
            icon: faTag,
            style: 'bg-purple'
        },
        {
            label: 'Юр адрес',
            value: 'address',
            icon: faCompass,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'ФИО',
            value: 'fio',
            icon: faAddressCard,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'ИНН',
            value: 'inn',
            icon: faPassport,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'ОКПО',
            value: 'okpo',
            icon: faIdCardClip,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'Банк',
            value: 'bank',
            icon: faBank,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'БИК',
            value: 'bik',
            icon: faMoneyCheckDollar,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'Банковский счёт',
            value: 'bank_account',
            icon: faCreditCard,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
        {
            label: 'Бухгалтер',
            value: 'accountant',
            icon: faPhone,
            style: 'bg-light border border-2 border-secondary-subtle color-purple'
        },
    ];

    const tableColumns = listSelectors.map(column => ({
        dataIndex: column.value,
        ...SearchByColumn(column.value),
        title: (
            <div className="d-flex align-items-center justify-content-between text-nowrap">
                <div className={`d-flex justify-content-center rounded align-items-center ${column.style}`}
                     style={{width: 32, height: 32}}>
                    <FontAwesomeIcon size="lg" icon={column.icon}/>
                </div>
                <div className="d-flex ms-4 me-3 justify-content-center lh-1">
                    {column.label}
                </div>
            </div>
        )
    }));

    const columns = tableColumns.map((col, index) => {
        const colKey = index; // правильный ключ для activeColumns
        return {
            title: () => (
                <Select
                    allowClear
                    placeholder="(Пустое поле)"
                    className='overflow-auto'
                    style={{width: 200}}
                    listHeight={280}
                    value={activeColumns[index] || undefined}
                    placement='bottomLeft'
                    onChange={(value) => handleHeaderChange(colKey, value)} // поменял на onChange и передаю colKey
                    options={listSelectors.map((column, index) => ({
                        value: column.value,
                        label: (
                            <div className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                <div className={`d-flex w-25 justify-content-center p-1 rounded ${column.style}`}>
                                    <FontAwesomeIcon size="lg" icon={column.icon}/>
                                </div>
                                <div className="d-flex ms-2 w-75 justify-content-center fst-normal">
                                    {column.label}
                                </div>
                            </div>
                        )
                    }))}
                />
            ),
            dataIndex: index,
            key: index,
            className: `${!activeColumns[colKey] ? 'table-cell-disabled' : ''}`,
        };
    });

    const handleUpdateDealer = async () => {
        setProcessingLoader(true);
        const payload = {
            data: dataTable,
            fields: tableFields,
        };

        try {
            if (tableFields.headers?.length < 10) {
                throw new Error('Не выбраны все столбцы')
            }

            const response = await fetch(DEALER_REPORTS_UPDATE_TSJ_DEALER_API, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                setUploadedFile([])
                setDataTable([])

                openNotification({type: "success", message: responseData.message});
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            openNotification({type: "error", message: `Ошибка при обновлении списка: ${error.message}`});
        } finally {
            setProcessingLoader(false);
        }
    };

    const uploadFile = async () => {
        const formData = new FormData();
        formData.append('file_encode', 'win-1251');
        formData.append('separator', ';');
        formData.append('files', uploadedFile[0]?.originFileObj);
        formData.append('fileName', uploadedFile[0]?.name);

        try {
            const response = await fetch(READ_ABONENT_SERVICE_DB_FILE_API, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json();
                //Удаляем первую строку с заголовками
                let tableData = responseData.data[0].data[0][1]
                const newArr = [...tableData.slice(0, 0), ...tableData.slice(1)];

                setDataTable(newArr)
            } else {
                const errorData = await response.json();
                console.error(`Ошибка при загрузке ${formData.get('fileName')}:`, errorData);
            }
        } catch (error) {
            console.error(`Ошибка сети при загрузке ${formData.get('fileName')}:`, error);
        }
    };

    useEffect(() => {
        if (uploadedFile && uploadedFile.length > 0) {
            uploadFile()
        }
    }, [uploadedFile]);

    return (
        <ProtectedElement allowedPermissions={'reports_dealer'}>
            <div>
                <Head>
                    <title>Список дилеров ТСЖ | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div>
                    <h1>Список дилеров ТСЖ</h1>
                    <ReportsNavigationTabs/>

                    {processingLoader ? (
                        <Preloader/>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between w-100">
                                <div className='card card-body flex-grow-0 w-50 shadow-sm me-3'>
                                    <Title level={5}>Дилеры ТСЖ</Title>
                                    <Text>Дилеры ТСЖ выступают в роли суб-дилеров поставщика Тезтап (ОсОО, MyDom.KG)
                                        (10187). При составлении отчётов по платежам нам необходимо разделять платежи по
                                        этим дилерам. Для этого поставщик периодически присылает обновлённый список
                                        дилеров, который мы сохраняем в нашей базе данных. На этой странице вы можете
                                        ознакомиться с текущим списком и обновить его при необходимости.</Text>
                                </div>
                                <div className='d-flex align-items-center justify-content-center w-50 flex-column'>
                                    <Title level={5}>Обновление списка дилеров ТСЖ</Title>
                                    <UploadInput
                                        maxFiles={1}
                                        allowedFileTypes={['.xlsx']}
                                        onUpload={(newFile) => {
                                            setUploadedFile(newFile)
                                        }}
                                        onRemove={() => setUploadedFile([])}
                                    />
                                </div>
                            </div>

                            {uploadedFile && uploadedFile.length > 0 ? (
                                <>
                                    <Alert
                                        message={
                                            <Title level={5}>Внимание! Вы действительно хотите обновить список дилеров
                                                ТСЖ?
                                            </Title>
                                        }
                                        description="Для обновления списка убедитесь, что данные распределены по
                                        столбцам корректно. Проверьте таблицу ниже: для каждого столбца должно быть выбрано
                                        соответсвующее значение. При необходимости отредактируйте их перед сохранением."
                                        action={
                                            <Button type='primary' className='ms-4 mt-4' onClick={handleUpdateDealer}>
                                                Обновить список
                                            </Button>
                                        }
                                        type='info'
                                        showIcon
                                        className="mb-4 mt-4 bg-info-subtle"
                                        icon={<FontAwesomeIcon size="lg" icon={faCircleExclamation}/>}
                                    />
                                    <SmartTable
                                        data={dataTable}
                                        size="small"
                                        className='fst-italic'
                                        scroll={{x: 'fit-content'}}
                                        columns={columns}
                                    />
                                </>
                            ) : (
                                <SmartTable
                                    key={JSON.stringify(uploadedFile)}
                                    model='DealerTSJ'
                                    size="small"
                                    scroll={{x: 'fit-content'}}
                                    columns={tableColumns}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedElement>
    );
}
