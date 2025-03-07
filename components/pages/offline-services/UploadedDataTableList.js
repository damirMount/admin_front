import React, {useMemo} from 'react';
import {Button, Divider, Result, Select, Table, Tabs, Tooltip, Typography} from "antd";
import ProtectedElement from "../../main/system/ProtectedElement";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAddressCard,
    faComment,
    faCompass,
    faCreditCard,
    faEye,
    faEyeSlash
} from "@fortawesome/free-regular-svg-icons";
import {faDollarSign, faPlus} from "@fortawesome/free-solid-svg-icons";
import Preloader from "../../main/system/Preloader";

const {Text, Title} = Typography;

const UploadedDataTableList = ({data, tableFields, setTableFields, loading = false}) => {
    // Локальное состояние для activeColumns оставляем, если оно нужно только для выбора типов заголовков.
    const activeColumns = useMemo(() => {
        return tableFields.headers.reduce((acc, header) => {
            acc[header.key] = header.type;
            return acc;
        }, {});
    }, [tableFields.headers]);

    // Вычисляем скрытые строки на основе tableFields.files
    const hiddenRows = useMemo(() => {
        if (tableFields.files && tableFields.files.length > 0) {
            const _hiddenRows = {};
            tableFields.files.forEach(file => {
                (file.hiddenElements || []).forEach(el => {
                    if (el.type === 'row') {
                        const compositeKey = `${file.fileName}-${el.sheet}`;
                        if (!_hiddenRows[compositeKey]) {
                            _hiddenRows[compositeKey] = new Set();
                        }
                        _hiddenRows[compositeKey].add(el.key);
                    }
                });
            });
            return _hiddenRows;
        }

    }, [tableFields.files]);

    // Вычисляем скрытые листы на основе tableFields.files
    const hiddenSheets = useMemo(() => {
        if (tableFields.files && tableFields.files.length > 0) {
            const _hiddenSheets = {};
            tableFields.files.forEach(file => {
                (file.hiddenElements || []).forEach(el => {
                    if (el.type === 'sheet') {
                        const compositeKey = `${file.fileName}-${el.sheet}`;
                        _hiddenSheets[compositeKey] = true;
                    }
                });
            });
            return _hiddenSheets;
        }
    }, [tableFields]);

    const handleHeaderChange = (colName, value) => {
        setTableFields(prev => {
            // Удаляем заголовки, которые уже установлены с таким значением, кроме текущего
            let headers = prev.headers.filter(
                header => !(header.key !== colName.toString() && header.type === value)
            );

            if (value === undefined || value === "") {
                // Удаляем запись для текущего столбца, если значение пустое
                headers = headers.filter(header => header.key !== colName.toString());
            } else {
                const index = headers.findIndex(header => header.key === colName.toString());
                if (index !== -1) {
                    // Создаём новый массив, заменяя нужный объект новым, уже с изменённым type
                    headers = headers.map(header =>
                        header.key === colName.toString() ? {...header, type: value} : header
                    );
                } else {
                    // Добавляем новую запись
                    headers = [...headers, {key: colName.toString(), type: value}];
                }
            }

            return {...prev, headers};
        });
    };

    // Функция скрытия/отображения строки
    const toggleStrikethrough = (fileName, sheetName, rowKey) => {
        setTableFields(prev => {
            // Копируем старый список файлов
            let newFiles = [...prev.files];

            // Ищем нужный файл
            const fileIndex = newFiles.findIndex(file => file.fileName === fileName);

            if (fileIndex !== -1) {
                // Если файл найден, обновляем его
                newFiles[fileIndex] = {
                    ...newFiles[fileIndex],
                    hiddenElements: toggleHiddenElement(newFiles[fileIndex].hiddenElements, sheetName, rowKey),
                };
            } else {
                // Если файла нет, создаем новый
                newFiles.push({
                    fileName,
                    hiddenElements: [{key: rowKey, type: 'row', sheet: sheetName}],
                });
            }

            return {...prev, files: newFiles};
        });
    };

// Функция для добавления/удаления элемента из hiddenElements
    const toggleHiddenElement = (hiddenElements = [], sheetName, rowKey) => {
        const exists = hiddenElements.some(el => el.key === rowKey && el.type === 'row' && el.sheet === sheetName);

        return exists
            ? hiddenElements.filter(el => !(el.key === rowKey && el.type === 'row' && el.sheet === sheetName))
            : [...hiddenElements, {key: rowKey, type: 'row', sheet: sheetName}];
    };


    // Функция переключения видимости листа
    const toggleSheetVisibility = (fileName, sheetKey, sheetName) => {
        setTableFields(prev => {
            const newFiles = prev.files.map(file => {
                if (file.fileName === fileName) {
                    const hiddenElements = file.hiddenElements || [];
                    const exists = hiddenElements.find(el => el.type === 'sheet' && el.sheet === sheetName && el.key === sheetKey);
                    const newHiddenElements = exists
                        ? hiddenElements.filter(el => !(el.type === 'sheet' && el.sheet === sheetName && el.key === sheetKey))
                        : [...hiddenElements, {key: sheetKey, type: 'sheet', sheet: sheetName}];
                    return {...file, hiddenElements: newHiddenElements};
                }
                return file;
            });
            return {...prev, files: newFiles};
        });
    };

    // Функция рендеринга таблицы
    const renderSheetTable = (sheetData) => {
        return sheetData.map((fileObj) => {
            const fileName = fileObj.fileName;
            const sheets = fileObj.data;

            const renderTableForSheet = (sheet) => {
                const [headers, rows, sheetNameArr] = sheet;
                // Извлекаем только название листа (если оно приходит как массив)
                const sheetName = Array.isArray(sheetNameArr) ? sheetNameArr[0] : sheetNameArr;

                const dataSource = Array.isArray(rows) && rows.length > 0
                    ? rows.map((row, index) => {
                        const rowObj = {};
                        headers.forEach((header, i) => {
                            rowObj[header] = row[i];
                        });
                        rowObj.key = index;
                        return rowObj;
                    })
                    : [];

                const actionColumn = {
                    title: '',
                    key: 'action',
                    className: 'text-center',
                    render: (record) => (
                        <Tooltip
                            title={hiddenRows && hiddenRows[`${fileName}-${sheetName}`]?.has(record.key) ? 'Показать строку' : 'Скрыть строку'}
                            placement='right'>
                            <Button type="text" onClick={() => toggleStrikethrough(fileName, sheetName, record.key)}>
                                <FontAwesomeIcon
                                    className="color-purple"
                                    icon={
                                        hiddenRows && hiddenRows[`${fileName}-${sheetName}`]?.has(record.key)
                                            ? faEyeSlash
                                            : faEye
                                    }
                                />
                            </Button>
                        </Tooltip>
                    ),
                };

                const columns = headers.map((colName) => {
                    return {
                        title: () => (
                            <Select
                                allowClear
                                placeholder="(Пустое поле)"
                                style={{width: 180}}
                                listHeight={330}
                                value={activeColumns[colName] || undefined}
                                onChange={(value) => handleHeaderChange(colName, value)}
                                options={[
                                    {
                                        value: 'identifier',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between p-1">
                                                <div
                                                    className="d-flex w-25 justify-content-center p-1   bg-purple  rounded">
                                                    <FontAwesomeIcon size="lg" icon={faCreditCard}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Реквизит
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'pay_sum',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between ">
                                                <div
                                                    className="d-flex w-25 justify-content-center p-1 border border-2 border-success bg-success text-light rounded">
                                                    <FontAwesomeIcon size="lg" icon={faDollarSign}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Сумма
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'fio',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faAddressCard}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    ФИО
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'address',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faCompass}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Адрес
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'comment',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faComment}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Комментарий
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'additional_field',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faPlus}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Доп.поле
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'additional_field_2',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faPlus}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Доп.поле 2
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        value: 'additional_field_3',
                                        label: (
                                            <div
                                                className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                                <div
                                                    className="d-flex w-25 justify-content-center bg-light p-1 border border-2 border-secondary-subtle rounded">
                                                    <FontAwesomeIcon size="lg" icon={faPlus}/>
                                                </div>
                                                <div className="d-flex ms-2 w-75 justify-content-center">
                                                    Доп.поле 3
                                                </div>
                                            </div>
                                        ),
                                    },

                                ]}
                            />
                        ),
                        dataIndex: colName,

                        key: colName,
                        className: `${!activeColumns[colName] ? 'table-cell-disabled' : ''} col-12`,
                    };
                });


                return (
                    <Table
                        size="small"
                        bordered
                        scroll={{x: 'fit-content'}}
                        columns={[actionColumn, ...columns]}
                        dataSource={dataSource}
                        rowClassName={(record) =>
                            hiddenRows && hiddenRows[`${fileName}-${sheetName}`]?.has(record.key) ? 'strikethrough' : ''
                        }
                    />
                );
            };

            if (sheets.length <= 1) {
                return (
                    <div key={fileName} className="d-flex flex-column mt-4">
                        <Divider>
                            <Title level={3}>{fileName}</Title>
                        </Divider>
                        {renderTableForSheet(sheets[0])}
                    </div>
                );
            } else {
                const tabItems = sheets.map((sheet) => {
                    const [headers, rows, sheetNameArr] = sheet;
                    const sheetName = Array.isArray(sheetNameArr) ? sheetNameArr[0] : sheetNameArr;
                    const sheetKey = `${fileName}-${sheetName}`;
                    return {
                        key: sheetKey,
                        label: (
                            <div
                                className="d-flex align-items-center justify-content-between color-purple"
                                style={{maxWidth: 180}}
                            >
                                <Text className="text-truncate">{sheetName}</Text>
                                <Tooltip
                                    title={hiddenSheets && hiddenSheets[sheetKey] ? 'Показать страницу' : 'Скрыть страницу'}>
                                    <Button
                                        type="text"
                                        className="ms-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSheetVisibility(fileName, sheetKey, sheetName);
                                        }}
                                        icon={
                                            <FontAwesomeIcon
                                                className="color-purple"
                                                icon={hiddenSheets && hiddenSheets[sheetKey] ? faEyeSlash : faEye}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </div>
                        ),
                        children: hiddenSheets && hiddenSheets[sheetKey] ? (
                            <div className="border rounded d-flex justify-content-center ">
                                <Result
                                    icon={
                                        <FontAwesomeIcon
                                            className="color-purple"
                                            style={{fontSize: 64}}
                                            icon={faEyeSlash}
                                        />
                                    }
                                    className="w-50"
                                    title="Данная вкладка скрыта"
                                    subTitle="Отображение этой вкладки отключено. Данные с неё не будут загружены в базу клиентов. Если вы хотите, чтобы данные были загружены, включите отображение вкладки заново."
                                />
                            </div>
                        ) : (
                            renderTableForSheet(sheet)
                        ),
                    };
                });
                return (
                    <div key={fileName} className="d-flex flex-column mt-4">
                        <Divider>
                            <Title level={3}>{fileName}</Title>
                        </Divider>
                        <Tabs type="card" hideAdd={true} items={tabItems}/>
                    </div>
                );
            }
        });
    };

    return (
        <ProtectedElement allowedPermissions={'update_database'}>
            {loading ? <Preloader/> : (data && data.length > 0 && renderSheetTable(data))}
        </ProtectedElement>
    );
};

export default UploadedDataTableList;
