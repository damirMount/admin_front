import React, {useState} from 'react';
import {Button, Image, message, Popconfirm, Progress, Tooltip, Typography, Upload} from 'antd';
import {useSession} from "next-auth/react";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DeleteOutlined} from "@ant-design/icons";
import FormatFileSize from "../table/cell/FormatFileSize";

const {Text} = Typography;

const UploadInput = ({onUpload, onRemove, allowedFileTypes = ['*']}) => {
    const {data: session} = useSession();
    const [fileList, setFileList] = useState([]);

    // Функция удаления файла из списка и уведомления родителя
    const handleRemove = (file) => {
        setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
        if (onRemove) {
            onRemove(file);
        }
    };

    const handleChange = (info) => {
        const {fileList: newFileList, file} = info;
        setFileList(newFileList);

        // Когда статус файла "done", просто передаем обновленный список файлов родителю.
        if (file.status === 'done') {
            onUpload(newFileList);
            message.success(`Файл ${file.name} успешно загружен.`);
        } else if (file.status === 'error') {
            message.error(`Не удалось загрузить файл ${file.name}`);
        }
    };

    const beforeUpload = (file) => {
        const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedFileTypes.includes(fileExt) && !allowedFileTypes.includes('*')) {
            message.error(`Файл ${file.name} не поддерживается. Разрешены только ${allowedFileTypes.join(', ')}`);
            return Upload.LIST_IGNORE;
        }
        const isDuplicate = fileList.some(existingFile => existingFile.name === file.name);
        if (isDuplicate) {
            message.error(`Файл ${file.name} уже добавлен в список.`);
            return Upload.LIST_IGNORE;
        }
        setFileList(prevList => [...prevList, file]);
        return true;
    };

    const customItemRender = (originNode, file, fileList) => {
        const fileName = file?.name || '';
        const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
        let customIcon;

        if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
            customIcon = (
                <Image preview={false} src="/images/svg/excel.svg" alt="Icon" width={40} height={40}/>
            );
        } else if (ext === '.dbf') {
            customIcon = (
                <Image preview={false} src="/images/svg/dbf.svg" alt="Icon" width={32} height={32}/>
            );
        } else if (file?.type?.startsWith('image/')) {
            customIcon = file.thumbUrl ? (
                <Image preview={false} src={file.thumbUrl} alt="Preview" width={40} height={40}/>
            ) : (
                <Image preview={false} src="/images/svg/picture.svg" alt="Icon" width={40} height={40}/>
            );
        } else {
            customIcon = (
                <Image preview={false} src="/images/svg/folder.svg" alt="Icon" width={40} height={40}/>
            );
        }

        const progressPercent = file.percent;

        return (
            <div className="card card-body rounded-3 bg-light d-flex flex-row align-items-center mt-1 mb-1">
                {/* Иконка файла */}
                <div
                    className="shadow-none card d-flex align-items-center justify-content-center"
                    style={{minWidth: 50, maxWidth: 50, height: 50}}
                >
                    {customIcon}
                </div>

                {/* Контейнер с названием и размером файла */}
                <div className="ms-3 me-3 d-flex flex-column flex-grow-1" style={{minWidth: 0}}>
                    <Text className="fw-bold text-truncate" title={fileName}>
                        {fileName}
                    </Text>
                    {file.status === 'uploading' && progressPercent !== undefined && (
                        <Progress percent={Math.round(progressPercent)} size="small" status="active"/>
                    )}
                    {file.status === 'error' && (
                        <Tooltip title={file.response?.message || "Не удалось загрузить файл"}>
                            <Text type="danger" className="text-truncate">
                                Ошибка загрузки
                            </Text>
                        </Tooltip>
                    )}
                    {file.status === 'done' && (
                        <Text type="secondary">{FormatFileSize(file.size)}</Text>
                    )}
                </div>

                {/* Кнопка удаления */}
                <div className="d-flex flex-row justify-content-end">
                    <Popconfirm placement="topLeft"
                                title={
                                    <div className='d-flex flex-column'>
                                        <Text>Вы уверены что хотите удалить этот файл?</Text>
                                        <Text>Все не сохранённые изменения будут сброшены.</Text>
                                    </div>}
                                onConfirm={() => handleRemove(file)}>
                        <Tooltip placement="topRight"
                                 title='Удалить файл'>
                            <Button
                                className="rounded ms-2 d-flex align-items-center justify-content-center"
                                style={{width: 40, height: 37}}
                                icon={<DeleteOutlined style={{fontSize: 16}}/>}
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex flex-column mt-1 w-100">
            <Upload
                name="files"
                className="d-flex flex-column-reverse justify-content-center align-items-center"
                accept={allowedFileTypes.join(',')}
                fileList={fileList}
                itemRender={customItemRender}
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                {fileList.length >= 8 ? null : (
                    <Button icon={<FontAwesomeIcon icon={faPlus}/>} className="mt-2" type="primary">
                        Загрузить файл
                    </Button>
                )}
            </Upload>
        </div>
    );
};

export default UploadInput;
