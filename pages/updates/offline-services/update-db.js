import React, {useEffect, useState} from 'react';
import Head from "next/head";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import {Button, Descriptions, Select, Tag, Tooltip, Typography} from "antd";
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import {PaperClipOutlined} from "@ant-design/icons";
import UploadDatabaseFileForm from "../../../components/pages/offline-services/UploadDatabaseFileForm";
import UploadedDataTableList from "../../../components/pages/offline-services/UploadedDataTableList";
import {
    GET_ABONENT_SERVICE_TEMPLATE_API,
    POST_ABONENT_SERVICE_API,
    UPDATE_ABONENT_SERVICE_TEMPLATE_API
} from "../../../routes/api";
import {faPenToSquare, faXmarkCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useAlert} from "../../../contexts/AlertContext";


const {Paragraph, Text} = Typography;

export default function UpdateDBPage() {
    const {openNotification, openConfirmAction, closeConfirmAction} = useAlert();
    const [resetKey, setResetKey] = useState(0);
    const [tableFields, setTableFields] = useState({headers: [], files: []});
    const [selectedService, setSelectedService] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [needConfirmChanges, setNeedConfirmChanges] = useState(false)

    const [defaultTemplateFormData, setDefaultTemplateFormData] = useState({
        separator: ';',
        file_encode: 'win1251',
        files: [],
        createdAt: '',
        updatedAt: '',
        create_author: '',
        update_author: '',
    });
    const [templateFormData, setTemplateFormData] = useState({
        separator: ';',
        file_encode: 'win1251',
        files: [],
        createdAt: '',
        updatedAt: '',
        create_author: '',
        update_author: '',
    });
    const {data: session} = useSession();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editTableFields, setEditTableFields] = useState(false);

    const handleSelectorChange = (valuesArray, name) => {
        if (name === 'files') {
            setTableFields((prevFormData) => ({
                ...prevFormData,
                [name]: valuesArray,
            }));
        }
        setTemplateFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };

    const itemsDesc = [
        {label: 'Шаблон создан', loading: {loading}, children: defaultTemplateFormData.createdAt || '(пусто)'},
        {label: 'Автор', children: defaultTemplateFormData.create_author || '(пусто)'},
        {label: 'Последнее обновление', children: defaultTemplateFormData.updatedAt || '(пусто)'},
        {label: 'Автор', children: defaultTemplateFormData.update_author || '(пусто)'},
    ];

    const getTemplate = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${GET_ABONENT_SERVICE_TEMPLATE_API}?service_id=` + selectedService, {
                method: 'GET',
                headers: {Authorization: `Bearer ${session?.accessToken}`},
            });

            const responseData = await response.json();

            if (response.ok) {
                setDefaultTemplateFormData(responseData.data);

                if (responseData.data.files === null) {
                    setDefaultTemplateFormData((prevFormData) => ({
                        ...prevFormData,
                        files: [],
                    }));

                }
                setTemplateFormData(responseData.data);
                setTableFields({
                    headers: Array.isArray(responseData.data.headers) ? responseData.data.headers : [],
                    files: Array.isArray(responseData.data.files) ? responseData.data.files : []
                });
            } else {
                setTableFields({
                    headers: [],
                    files: []
                });
                setDefaultTemplateFormData((prevFormData) => ({
                    ...prevFormData,
                    separator: ';',
                    file_encode: 'win1251',
                    files: [],
                    headers: [],
                    createdAt: '',
                    updatedAt: '',
                    create_author: '',
                    update_author: '',
                }));
                setTemplateFormData((prevFormData) => ({
                    ...prevFormData,
                    separator: ';',
                    file_encode: 'win1251',
                    files: [],
                    headers: [],
                    createdAt: '',
                    updatedAt: '',
                    create_author: '',
                    update_author: '',
                }));
            }

            setLoading(false);
        } catch (error) {
            openNotification({type: "error", message: error.message});
            setLoading(false);
        }
    };


    const updateTemplate = async () => {

        try {
            if (!tableFields.headers.some(header => header.type === 'identifier')) {
                throw new Error(`В шаблоне не выбрано поле для реквизита!`);
            }

            templateFormData.service_id = selectedService
            templateFormData.create_author = defaultTemplateFormData.create_author || session.user.name;
            templateFormData.update_author = session.user.name;
            templateFormData.files = tableFields.files || [];
            templateFormData.headers = tableFields.headers || [];

            const formData = templateFormData
            formData.service_id = selectedService

            const response = await fetch(UPDATE_ABONENT_SERVICE_TEMPLATE_API, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            const responseData = await response.json();
            if (response.ok) {
                setDefaultTemplateFormData(templateFormData);
                setDefaultTemplateFormData((prevFormData) => ({
                    ...prevFormData,
                    files: tableFields.files
                }));
                closeConfirmAction();
                setNeedConfirmChanges(false)
                openNotification({type: "success", message: responseData.message});
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            openNotification({type: "error", message: error.message});
        }
    };


    const handleSend = async () => {
        setLoading(true);
        try {
            if (needConfirmChanges) {
                throw new Error(`У вас есть не сохранённые изменения! Сохраните или отмените их чтобы продолжить`)
            }
            if (defaultTemplateFormData.files.length !== uploadedFiles.length) {
                throw new Error(`Загружено ${uploadedFiles.length} из ${defaultTemplateFormData.files.length} файлов. Загрузите недостающие файлы, либо обновите шаблон для продолжения`)
            }

            const templateFiles = defaultTemplateFormData.files.map(file => file.fileName).sort();
            const uploadedFilesArray = uploadedFiles.map(file => file.name).sort();

            if (JSON.stringify(templateFiles) !== JSON.stringify(uploadedFilesArray)) {
                throw new Error(`Названия файлов должны совпадать с названиями указанными в шаблоне`);
            }
            if (!tableFields.headers.some(header => header.type === 'identifier')) {
                throw new Error(`В шаблоне не выбрано поле для реквизита!`);
            }

            templateFormData.service_id = selectedService
            templateFormData.create_author = defaultTemplateFormData.create_author || session.user.name;
            templateFormData.update_author = session.user.name;
            templateFormData.files = tableFields.files || [];
            templateFormData.headers = tableFields.headers || [];

            const formData = templateFormData
            formData.service_id = selectedService

            const response = await fetch(POST_ABONENT_SERVICE_API, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });

            const responseData = await response.json();
            if (response.ok) {
                setDefaultTemplateFormData(templateFormData);
                setDefaultTemplateFormData((prevFormData) => ({
                    ...prevFormData,
                    files: tableFields.files
                }));
                openNotification({type: "success", message: responseData.message});
            } else {
                openNotification({type: "error", message: responseData.message});
            }

            setLoading(false);
        } catch (error) {
            openNotification({type: "error", message: error.message});
            setLoading(false);
        }
    };

    const isHiddenElementsDifferent = (defaultFiles = [], newFiles = []) => {
        const filesA = Array.isArray(defaultFiles) ? defaultFiles : [];
        const filesB = Array.isArray(newFiles) ? newFiles : [];
        if (filesA.length !== filesB.length) return true; // Если разное количество файлов, сразу `true`

        return filesA.some((fileA, index) =>
            JSON.stringify(fileA.hiddenElements) !== JSON.stringify(filesB[index]?.hiddenElements)
        );
    };

    const sortHeaders = headers => headers.slice().sort((a, b) => a.key.localeCompare(b.key));

    const areHeadersEqual = (defaultHeaders, newHeaders) => {
        // Если один из массивов undefined, рассматриваем его как пустой массив
        const defaultHeadersArray = Array.isArray(defaultHeaders) ? defaultHeaders : [];
        const newHeadersArray = Array.isArray(newHeaders) ? newHeaders : [];

        if (defaultHeadersArray.length !== newHeadersArray.length) return false;
        const sortedDefaultHeaders = sortHeaders(defaultHeadersArray);
        const sortedNewHeaders = sortHeaders(newHeadersArray);
        return sortedDefaultHeaders.every((header, index) =>
            header.key === sortedNewHeaders[index].key && header.type === sortedNewHeaders[index].type
        );
    };

    const onResetConfirm = () => {
        setTemplateFormData(defaultTemplateFormData);
        setTableFields({
            headers: Array.isArray(defaultTemplateFormData.headers) ? defaultTemplateFormData.headers : [],
            files: Array.isArray(defaultTemplateFormData.files) ? defaultTemplateFormData.files : []
        });
        setResetKey(prev => prev + 1);
        closeConfirmAction();
        setNeedConfirmChanges(false)
    };

    useEffect(() => {
        if (
            templateFormData && defaultTemplateFormData &&
            (
                JSON.stringify(templateFormData) !== JSON.stringify(defaultTemplateFormData) ||
                !areHeadersEqual(defaultTemplateFormData.headers, tableFields.headers) ||
                isHiddenElementsDifferent(defaultTemplateFormData.files, tableFields.files) && tableFields.files >= defaultTemplateFormData.files
            )
        ) {
            openConfirmAction({
                onSave: async () => {
                    await updateTemplate();
                },
                onReset: () => {
                    onResetConfirm();
                },
            });
            setNeedConfirmChanges(true)
        } else {
            closeConfirmAction();
            setNeedConfirmChanges(false)
        }
    }, [templateFormData, defaultTemplateFormData, tableFields]);

    useEffect(() => {
        return () => {
            closeConfirmAction();
        };
    }, []);

    useEffect(() => {
        if (selectedService !== '' && selectedService !== undefined && selectedService !== defaultTemplateFormData.service_id) {
            getTemplate();
        }
    }, [selectedService]);

    return (
        <ProtectedElement allowedPermissions={'update_database'}>
            <Head>
                <title>Обновление базы данных оффлайн сервисов | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column justify-content-center" style={{minHeight: '80vh'}}>
                <div className="d-flex mt-3 flex-row justify-content-between">
                    <div className="card card-body w-50 d-flex flex-column justify-content-between">
                        <div className="d-flex flex-column">
                            <UniversalSelect
                                type="text"
                                isDisabled={loading}
                                className="input-field"
                                id="service"
                                name="service_id"
                                label="Услуга"
                                firstOptionSelected={true}
                                placeholder="Выберете услугу"
                                onSelectChange={(selectedValue) => {
                                    if (selectedService !== selectedValue) {
                                        setSelectedService(selectedValue);
                                    }
                                }}

                                fetchDataConfig={{
                                    model: 'Service',
                                }}
                                required
                            />
                            <div className="d-flex justify-content-between mb-3"
                                 key={JSON.stringify(selectedService) && JSON.stringify(defaultTemplateFormData)}>
                                <UniversalSelect
                                    key={`file_encode_${resetKey}`}
                                    type="text"
                                    isDisabled={loading}
                                    isSearchable={false}
                                    className="input-field me-2"
                                    id="file_encode"
                                    name="file_encode"
                                    label="Кодировка файла"
                                    firstOptionSelected={true}
                                    placeholder="Кодировка"
                                    selectedOptions={[defaultTemplateFormData.file_encode]}
                                    onSelectChange={handleSelectorChange}
                                    options={[
                                        {label: 'Windows-1251', value: 'win1251'},
                                        {label: 'UTF-8', value: 'utf8'},
                                        {label: 'CP866', value: 'cp866'},
                                    ]}
                                    required
                                />
                                <UniversalSelect
                                    key={`separator_${resetKey}`}
                                    type="text"
                                    isDisabled={loading}
                                    isSearchable={false}
                                    className="input-field"
                                    id="separator"
                                    name="separator"
                                    label="Разделитель"
                                    firstOptionSelected={true}
                                    selectedOptions={[defaultTemplateFormData.separator]}
                                    placeholder="Разделитель"
                                    onSelectChange={handleSelectorChange}
                                    options={[
                                        {label: 'Точка с запятой', value: ';'},
                                        {label: 'Двоеточие', value: ':'},
                                        {label: 'Запятая', value: ','},
                                    ]}
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-100" key={JSON.stringify(defaultTemplateFormData.files)}>
                            <Descriptions layout="vertical" size="small" column={2} title="Описание" items={itemsDesc}/>
                            <div className="w-100 d-flex justify-content-between text-center align-items-center mb-2">
                                <Text type="secondary">Список файлов:</Text>
                                <Tooltip title={editTableFields ? 'Закрыть' : ' Редактировать'}>
                                    <Button
                                        type="text"
                                        onClick={() => setEditTableFields((prev) => !prev)}
                                        icon={<FontAwesomeIcon className="color-purple"
                                                               icon={editTableFields ? faXmarkCircle : faPenToSquare}/>}
                                    />
                                </Tooltip>
                            </div>
                            {editTableFields ? (
                                <Select
                                    mode="multiple"
                                    placeholder="Выберите файлы"
                                    onChange={values => handleSelectorChange(
                                        values.map(value => defaultTemplateFormData.files.find(item => item.fileName === value)),
                                        'files'
                                    )}
                                    showSearch={false}
                                    value={Array.isArray(templateFormData.files) ? templateFormData.files.map(item => item.fileName) : []}  // Проверка, что это массив
                                    style={{width: '100%'}}
                                    options={defaultTemplateFormData.files?.map(item => ({
                                        value: item.fileName,  // Используем fileIndex
                                        label: (
                                            <>
                                                <PaperClipOutlined
                                                    style={{fontSize: 14}}/> {item.fileName} {/* Отображаем имя файла */}
                                            </>
                                        ),
                                    }))}
                                />

                            ) : (
                                templateFormData.files && templateFormData.files.length > 0
                                    ? templateFormData.files.map(file => {
                                        return <>
                                            <Tooltip title={file.fileName || 'undefined'}>
                                                <Tag
                                                    style={{maxWidth: '100%'}}
                                                    icon={<PaperClipOutlined style={{fontSize: 14}}/>}
                                                    color="blue"
                                                    className='me-1 text-truncate'
                                                >
                                                    {file.fileName || 'undefined'}
                                                </Tag>
                                            </Tooltip>
                                        </>
                                    }) : defaultTemplateFormData.files && defaultTemplateFormData.files.length > 0
                                        ? 'Доступно: ' + defaultTemplateFormData.files.length + ' шаблон' : '(пусто) '
                            )}
                        </div>
                        <Button type="primary" className="mt-4" onClick={handleSend} loading={loading}>
                            Обновить базу данных
                        </Button>
                    </div>
                    <div className="d-flex card card-body w-75 justify-content-start ms-5">
                        <UploadDatabaseFileForm
                            templateFormData={templateFormData}
                            defaultTemplateFormData={defaultTemplateFormData}
                            setTableFields={setTableFields}
                            setUploadedFiles={setUploadedFiles}
                            selectedService={selectedService}
                            onChange={(newData) => setData(newData)}
                            onLoading={(loadingStatus) => setLoading(loadingStatus)}
                        />
                    </div>
                </div>
                <UploadedDataTableList
                    data={data}
                    tableFields={tableFields}
                    setTableFields={setTableFields}
                    loading={loading}
                />

            </div>
        </ProtectedElement>
    );
}
