import React, {useEffect, useState} from "react";
import Preloader from "../../../components/main/system/Preloader";
import ReportsNavigationTabs from "../../../components/pages/report/ReportsNavigationTabs";
import {DEALER_CREATE_PAYMENTS_REPORT_API, DEALER_EXPORT_REPORT_1C_API} from "../../../routes/api";
import Head from "next/head";
import DateRangePicker from "../../../components/main/input/DateRangePicker";
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import {useSession} from "next-auth/react";
import {useAlert} from "../../../contexts/AlertContext";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import {Button, Descriptions, Divider, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudUpload, faDownload} from "@fortawesome/free-solid-svg-icons";
import fetchData from "../../../components/main/database/DataFetcher";
import * as XLSX from "xlsx";
import SmartTable from "../../../components/main/table/SmartTable";
import ModalWindow from "../../../components/main/system/ModalWindow";


const {Text, Title} = Typography;

export default function DealerExportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [processingLoader, setProcessingLoader] = useState(false);
    const {openNotification} = useAlert();
    const [fileDownloaded, setFileDownloaded] = useState([]);
    const [reportData, setReportData] = useState([])
    const [showModal, setShowModal] = useState(false)
    const modalData = {
        title: 'Внимание подтвердите действие',
        message: `Вы действительно уверены что хотите выгрузить данный отчёт в 1С? Учтите будут загружены только 
        те данные что были сформированы конкретно в этом отчёте, и что указаны в таблице снизу. Перед тем как подтвердить 
        выгрузку, обязательно проверьте все данные ещё раз.`,
        button: 'Выгрузить',
        buttonVariant: `purple`,
    };
    const [formData, setFormData] = useState({
        startDate: null,
        endDate: null,
    });
    const [oldFormData, setOldFormData] = useState({});
    const {data: session} = useSession(); // Получаем сессию
    const [dealerOptions, setDealerOptions] = useState(
        [{label: 'По всем дилерам', value: 'all', isSelectOne: true}]
    );
    const [providerOptions, setProviderOptions] = useState(
        [{label: 'По всем поставщикам', value: 'all', isSelectOne: true}],
    );

    const statusOptions = [
        {label: 'Успешные', value: 'success'},
        {label: 'Ошибочные', value: 'error'},
    ]
    const timeOptions = [
        {label: 'Проведения', value: 'conducting'},
        {label: 'Поступления', value: 'receipts'},
    ]

    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };

    const tableColumns = [
        {
            title: 'Дата',
            className: 'col-2',
            dataIndex: 'Дата',
        },
        {
            title: 'Код дилера',
            dataIndex: 'Код дилера',
        },
        {
            title: 'Дилер',
            dataIndex: 'Дилер',
            className: 'col-3',
        },
        {
            title: 'Код договора',
            dataIndex: 'Код договора дилера',
        },
        {
            title: 'Код поставщика',
            dataIndex: 'Код поставщика',
        },
        {
            title: 'Поставщик',
            dataIndex: 'Поставщик',
            className: 'col-3',
        },
        {
            title: 'Код договора',
            dataIndex: 'Код договора поставщика',
        },
        {
            title: 'Сумма',
            dataIndex: 'Сумма',
        },
        {
            title: 'Дилер ТСЖ',
            dataIndex: 'Дилер ТСЖ',
            className: 'col-3',
        },

    ];

    const getDealers = async () => {
        const fetchDBConfig = {
            model: 'Dealer',
            searchTerm: {blocked: 0, id_blocklevel: 0, accurateSearch: true},
            sort: '{"column":"name","direction":"asc"}',
        };

        try {
            const response = await fetchData(fetchDBConfig, session);
            const responseData = response.data;

            setDealerOptions((prevOptions) => [
                ...prevOptions,
                ...responseData.map(dealer => ({
                    label: dealer.name + ' ' + dealer.id, // Предполагаем, что у дилера есть `name`
                    value: dealer.id    // Предполагаем, что у дилера есть `id`
                }))
            ]);
        } catch (e) {
            console.log('Ошибка загрузки списка дилеров: ' + e)
        }
    };

    const getProviders = async () => {
        const fetchDBConfig = {
            model: 'Server',
            searchTerm: {is_test: false, accurateSearch: true},
            sort: '{"column":"name","direction":"asc"}',
        };

        try {
            const response = await fetchData(fetchDBConfig, session);
            const responseData = response.data;

            setProviderOptions((prevOptions) => [
                ...prevOptions,
                ...responseData.map(provider => ({
                    label: provider.name + ' ' + provider.id, // Предполагаем, что у дилера есть `name`
                    value: provider.id    // Предполагаем, что у дилера есть `id`
                }))
            ]);
        } catch (e) {
            console.log('Ошибка загрузки списка поставщиков: ' + e)
        }
    };

    const handleCreateReport = async () => {
        try {
            const dataToSend = {
                formData,
            };
            setProcessingLoader(true);

            const response = await fetch(DEALER_CREATE_PAYMENTS_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                openNotification({type: "success", message: "Отчет успешно создан."});
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const arrayBuffer = await blob.arrayBuffer();

                // Читаем Excel
                const workbook = XLSX.read(arrayBuffer, {type: 'array'});

                // Получаем первый лист
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Конвертируем в JSON
                const data = XLSX.utils.sheet_to_json(sheet);
                setReportData(data)


                const fileName = `Отчёт c ${startDate} по ${endDate}.xlsx`;
                setOldFormData(formData)

                setFileDownloaded({
                    fileName: fileName,
                    startDate: startDate,
                    endDate: endDate,
                    url: url,
                    timeType: formData.timeType,
                    paymentsStatus: formData.paymentsStatus,
                    selectedDealers: formData.selectedDealers,
                    selectedProviders: formData.selectedProviders
                });
            } else {
                const responseData = await response.json();
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            console.error('Произошла ошибка при создании отчета: ', error);
            openNotification({type: "error", message: "Произошла ошибка при создании отчета: " + error.message });
        } finally {
            setProcessingLoader(false);
        }
    };

    const handleSendTo1C = async () => {
        try {
            if (!reportData.length > 0) {
                throw new Error("Отчёт не должен быть пустым")
            }
            const dataToSend = {
                ...oldFormData,
            };

            setProcessingLoader(true);

            const response = await fetch(DEALER_EXPORT_REPORT_1C_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                openNotification({type: "success", message: "Отчет успешно создан."});
            } else {
                const responseData = await response.json();
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            console.error('Ошибка при отправке в 1C:', error);
            openNotification({type: "error", message: "Произошла ошибка  при отправке в 1C: " + error.message });
        } finally {
            setProcessingLoader(false);
        }
    };

    const handleDownloadReport = () => {
        if (!fileDownloaded || !fileDownloaded.url) {
            openNotification({type: "error", message: "Файл ещё не готов или произошла ошибка"});
            return;
        }

        const link = document.createElement('a');
        link.href = fileDownloaded.url;
        link.download = fileDownloaded.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: startDate,
            endDate: endDate,
        }));
    }, [startDate, endDate]);

    const descTypeReport = [
        {
            label: 'Статус платежей',
            children: statusOptions.find(option => option.value === fileDownloaded.paymentsStatus)?.label || '(пусто)'
        },
        {
            label: 'По времени',
            children: timeOptions.find(option => option.value === fileDownloaded.timeType)?.label || '(пусто)'
        },
    ];

    const descTypeCustomers = [
        {
            label: 'Дилер',
            children: Array.isArray(fileDownloaded.selectedDealers) && fileDownloaded.selectedDealers.length > 0
                ? dealerOptions
                    .filter(option => fileDownloaded.selectedDealers.includes(option.value))
                    .map(option => option.label)
                    .join(', ')
                : '(пусто)'
        },
        {
            label: 'Поставщик',
            children: Array.isArray(fileDownloaded.selectedProviders) && fileDownloaded.selectedProviders.length > 0
                ? providerOptions
                    .filter(option => fileDownloaded.selectedProviders.includes(option.value))
                    .map(option => option.label)
                    .join(', ')
                : '(пусто)'
        },
    ];


    useEffect(() => {
        getDealers()
        getProviders()
    }, []);

    useEffect(() => {
        console.log(oldFormData.startDate)
    }, [oldFormData]);

    return (
        <ProtectedElement allowedPermissions={'reports_dealer'}>
            <ModalWindow
                showModal={showModal} // Передаем состояние модального окна
                data={modalData}
                closeModal={() => setShowModal(false)} // Передаем функцию для закрытия модального окна
                onHandle={handleSendTo1C} // Передаем функцию для вызова при нажатии на кнопку в модальном окне
            />
            <div>
                <Head>
                    <title>Отчёты по истории платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div className="w-100 mt-5">
                    <h1>Выгрузка отчета по истории платежей</h1>
                    <ReportsNavigationTabs/>

                    {processingLoader && (
                        <Preloader/>
                    )}

                    <div className={`${processingLoader ? 'd-none' : 'd-flex'}  w-100 flex-column`}>
                        <div className="d-flex flex-row  ">
                            <div className=" d-flex flex-column w-50 align-items-start">
                                <div className='card card-body align-items-center'>
                                    <div className='d-flex justify-content-between w-100'>
                                        <UniversalSelect
                                            label={'Статус платежей'}
                                            firstOptionSelected
                                            options={statusOptions}
                                            isSearchable={false}
                                            required
                                            onSelectChange={handleSelectorChange}
                                            name="paymentsStatus"
                                            className="me-2"
                                        />
                                        <UniversalSelect
                                            label={'По времени'}
                                            firstOptionSelected
                                            options={timeOptions}
                                            isSearchable={false}
                                            onSelectChange={handleSelectorChange}
                                            required
                                            name="timeType"
                                        />
                                    </div>
                                    <UniversalSelect
                                        style={{maxWidth: 318}}
                                        key={JSON.stringify(dealerOptions)}
                                        label={'Дилер'}
                                        firstOptionSelected
                                        isMulti={true}
                                        options={dealerOptions}
                                        required
                                        onSelectChange={handleSelectorChange}
                                        name="selectedDealers"
                                    />
                                    <UniversalSelect
                                        style={{maxWidth: 318}}
                                        key={JSON.stringify(providerOptions)}
                                        label={'Поставщик'}
                                        firstOptionSelected
                                        isMulti={true}
                                        options={providerOptions}
                                        required

                                        onSelectChange={handleSelectorChange}
                                        name="selectedProviders"
                                    />

                                    <DateRangePicker
                                        onDateChange={(dates) => {
                                            setStartDate(dates[0]);
                                            setEndDate(dates[1]);
                                        }}
                                        allowClear={false}
                                    />

                                    <Button type="primary" className='mt-4 fw-medium'
                                            onClick={handleCreateReport}>
                                        Создать отчёт
                                    </Button>
                                </div>
                            </div>
                            <div
                                className="w-75  h-100 card card-body d-flex flex-column align-items-center justify-content-between">
                                <div>
                                    <Title level={5}>Информация</Title>
                                    <Text type='secondary'>В данном разделе вы можете создать отчёт по
                                        проведённым платежам в разрезе дилеров и поставщиков, который предназначен для
                                        выгрузки в систему 1С. Для создания отчёта выберите необходимые параметры, после
                                        чего нажмите на кнопку создать отчёт, после его создания вы сможете скачать
                                        его к себе на компьютер, либо загрузить в 1С
                                    </Text>
                                </div>

                                {fileDownloaded.url && (
                                    <div key={JSON.stringify(fileDownloaded)}>
                                        <Divider/>
                                        <div className='d-flex  flex-column card card-body bg-light shadow-sm '>
                                            <Title level={5}>Отчёт
                                                c {fileDownloaded.startDate} по {fileDownloaded.endDate}</Title>

                                            <div className="d-flex align-items-center ">
                                                <div className='d-flex flex-column'>
                                                    <Descriptions layout="horizontal" size="small" column={2}
                                                                  items={descTypeReport}/>
                                                    <Descriptions layout="horizontal" size="small" column={1}
                                                                  style={{maxWidth: '95%'}}
                                                                  className=' text-truncate '
                                                                  items={descTypeCustomers}/>
                                                </div>
                                                <div className='d-flex flex-column  justify-content-between '>
                                                    <Button type="primary" className='mb-2 shadow-lg'
                                                            icon={<FontAwesomeIcon size='lg' icon={faDownload}/>}
                                                            onClick={handleDownloadReport}>
                                                        Скачать
                                                    </Button>
                                                    {/*<Button type="default" className='border-secondary shadow'*/}
                                                    {/*        onClick={() => setShowModal(true)}>*/}
                                                    {/*    <FontAwesomeIcon size='lg' className='me-2'*/}
                                                    {/*                     icon={faCloudUpload}/>*/}
                                                    {/*    Выгрузить в 1С*/}
                                                    {/*</Button>*/}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                        {oldFormData.startDate && (
                            <div className='mt-4'>
                                <Divider><Title level={4}>Сформированный отчёт</Title></Divider>
                                <SmartTable
                                    className='mt-5'
                                    size='middle'
                                    scroll={{x: 'fit-content'}}
                                    columns={tableColumns}
                                    data={reportData}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
};
