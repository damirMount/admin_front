import React, {useEffect, useState} from 'react';
import {
    CheckCircleOutlined,
    DatabaseOutlined,
    DownloadOutlined,
    EyeInvisibleOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {Carousel, Result, Typography} from "antd";
import {useSession} from "next-auth/react";
import {READ_ABONENT_SERVICE_DB_FILE_API} from "../../../routes/api";
import ProtectedElement from "../../main/system/ProtectedElement";
import UploadInput from "../../main/input/UploadInput";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-regular-svg-icons";

const {Text, Title} = Typography;

const UploadDatabaseFileForm = ({
                                    templateFormData,
                                    defaultTemplateFormData,
                                    selectedService,
                                    onChange,
                                    onLoading,
                                    setTableFields,
                                    setUploadedFiles
                                }) => {
    const {data: session} = useSession();
    const [uploadedFilesList, setUploadedFilesList] = useState([]);

    const tutorialItems = [
        {
            label: 'Обновление базы данных клиентов',
            icon: <DatabaseOutlined style={{color: "purple", fontSize: 65}}/>,
            desc: ' В этом разделе вы можете обновить оффлайн базу данных клиентов. Все изменения, сделанные в интерфейсе, будут автоматически сохранены в шаблон и учтены при следующем обновлении, чтобы поддерживать актуальность данных.',
        },
        {
            label: 'Настройка шаблона',
            icon: <SettingOutlined style={{color: "purple", fontSize: 65}}/>,
            desc: 'Сначала выберите услугу, для которой необходимо выполнить обновление. После выбора загрузится шаблон настроек, использовавшихся ранее. Все изменения в настройках будут обновлять шаблон, который сохраняет все ваши предпочтения для будущих обновлений.',
        },
        {
            label: 'Загрузка файлов',
            icon: <DownloadOutlined style={{color: "purple", fontSize: 65}}/>,
            desc: 'Загрузите все необходимые файлы, полученные от Клиентов (Поставщиков услуг). Важно, чтобы имена файлов совпадали с теми, что использовались в прошлый раз. В карточке слева будет отображен список ранее использованных файлов для вашего удобства.',
        },
        {
            label: 'Фильтрация данных',
            icon: <EyeInvisibleOutlined style={{color: "purple", fontSize: 65}}/>,
            desc: (
                <div className='text-center'>
                    <Text type='secondary'>После загрузки откроется предпросмотр файлов. Вам нужно будет отфильтровать
                        данные по категориям, таким
                        как &quot;Реквизит&quot;, &quot;Сумма&quot;, &quot;Комментарий&quot;.
                        Кроме того, можно скрыть отдельные записи, которые не должны быть загружены в базу данных,
                        с помощью кнопки &quot;
                        <FontAwesomeIcon
                            className="color-purple"
                            icon={faEye}
                        />&quot;
                    </Text>
                </div>
            )
        },
        {
            label: 'Обновление базы',
            icon: <CheckCircleOutlined style={{color: "purple", fontSize: 65}}/>,
            desc: 'После настройки всех параметров просто нажмите кнопку обновления. Это позволит загрузить данные в базу согласно вашим настройкам. Если вы изменили шаблон, он также будет обновлен или создан новый, если ранее он не существовал.'
        },
    ];

    // Функция загрузки файла
    const uploadFile = async (formData) => {
        onLoading(true);
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
                onChange(prevData => {
                    const existingFiles = Array.isArray(prevData) ? prevData : [];
                    const newFiles = responseData.data.map(file => ({
                        data: file.data,
                        fileIndex: file.fileIndex,
                        fileName: file.fileName
                    }));
                    // Создаем карту файлов, где ключом является fileName
                    const fileMap = {};
                    existingFiles.forEach(file => {
                        fileMap[file.fileName] = file;
                    });
                    // Новые записи заменят существующие, если ключ совпадает, или добавятся, если ключ новый
                    newFiles.forEach(newFile => {
                        fileMap[newFile.fileName] = newFile;
                    });
                    // Возвращаем массив обновленных файлов
                    return Object.values(fileMap);
                });

                setTableFields(prevData => {
                    const existingFiles = Array.isArray(prevData?.files) ? prevData.files : [];

                    // Создаем карту существующих файлов для быстрого поиска
                    const fileMap = new Map(existingFiles.map(file => [file.fileName, file]));

                    // Создаем новый массив, обновляя только те файлы, которые есть в responseData
                    const updatedFiles = existingFiles.map(file => {
                        const newFileData = responseData.data.find(f => f.fileName === file.fileName);
                        if (newFileData && file.fileIndex !== newFileData.fileIndex) {
                            // Если fileIndex изменился, обновляем его, но сохраняем остальные данные
                            return {...file, fileIndex: newFileData.fileIndex};
                        }
                        return file;
                    });

                    // Добавляем новые файлы, если их не было
                    responseData.data.forEach(file => {
                        if (!fileMap.has(file.fileName)) {
                            updatedFiles.push({
                                fileName: file.fileName,
                                fileIndex: file.fileIndex,
                                hiddenElements: []
                            });
                        }
                    });
                    return {
                        ...prevData,
                        files: updatedFiles
                    };
                });
            } else {
                const errorData = await response.json();
                console.error(`Ошибка при загрузке ${formData.get('fileName')}:`, errorData);
            }

            onLoading(false);
        } catch (error) {

            console.error(`Ошибка сети при загрузке ${formData.get('fileName')}:`, error);
            onLoading(false);
        }
    };

    const uploadSingleFile = async (fileArray) => {
        if (!fileArray || fileArray.length === 0) return;
        // Выбираем последний файл из массива
        const lastIndex = fileArray.length - 1;
        const fileObj = fileArray[lastIndex];

        const formData = new FormData();
        formData.append('file_encode', templateFormData.file_encode);
        formData.append('separator', templateFormData.separator);
        formData.append('files', fileObj.originFileObj);
        formData.append('fileName', fileObj.name);

        await uploadFile(formData);
    };

    const uploadFilesBatch = async () => {
        if (uploadedFilesList.length === 0) {
            console.warn("Нет файлов для загрузки.");
            return;
        }

        for (const fileObj of uploadedFilesList) {
            if (!(fileObj.originFileObj instanceof File)) {
                console.warn("Некорректный файл:", fileObj);
                continue;
            }

            const formData = new FormData();
            formData.set('file_encode', templateFormData.file_encode);
            formData.set('separator', templateFormData.separator);
            formData.set('files', fileObj.originFileObj);
            formData.set('fileName', fileObj.name);

            await uploadFile(formData);
        }
    };

    const uploadFileOnServer = async (file = null) => {
        if (file) {
            await uploadSingleFile(file);
        } else {
            await uploadFilesBatch();
        }
    };

    const handleFileRemove = (file) => {
        // Обновляем состояние, через onChange, где файлы хранятся под ключом files
        onChange(prevData =>
            Array.isArray(prevData)
                ? prevData.filter(fileItem => fileItem.fileName !== file.name)
                : []
        );

        // Обновляем состояние загруженных файлов
        setUploadedFilesList(prevList =>
            Array.isArray(prevList) ? prevList.filter(fileItem => fileItem.name !== file.name) : []
        );

        setTableFields(prevData => ({
            ...prevData,
            files: Array.isArray(prevData.files)
                ? prevData.files.filter(f => f.fileName !== file.name)
                : []
        }));

    };

    useEffect(() => {
        if (uploadedFilesList.length > 0) {
            uploadFileOnServer();
        }
    }, [templateFormData.separator, templateFormData.file_encode, defaultTemplateFormData.separator, defaultTemplateFormData.file_encode, selectedService]);

    useEffect(() => {
        setUploadedFiles(uploadedFilesList)
    }, [uploadedFilesList]);

    return (
        <ProtectedElement allowedPermissions={'update_database'}>
            <div
                className="d-flex user-select-none justify-content-center align-items-center bg-light rounded border mb-2">
                <Carousel draggable={true} autoplay={true} style={{maxWidth: 560}} autoplaySpeed={15000}>
                    {tutorialItems.map(item => (
                        <Result
                            key={item.label}
                            icon={uploadedFilesList.length <= 2 ? item.icon : false}
                            title={item.label}
                            subTitle={item.desc}
                        />
                    ))}
                </Carousel>
            </div>
            <UploadInput
                allowedFileTypes={['.xlsx', '.xls', '.dbf', '.csv']}
                onUpload={(newFile) => {
                    setUploadedFilesList(newFile);
                    uploadFileOnServer(newFile);
                }}
                onRemove={handleFileRemove}
            />
        </ProtectedElement>
    );
};

export default UploadDatabaseFileForm;
