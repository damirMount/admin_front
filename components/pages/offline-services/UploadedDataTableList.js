import React, {useMemo} from 'react';
import {Alert, Button, Divider, Result, Select, Table, Tabs, Tooltip, Typography} from "antd";
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
import {faDollarSign, faPlus, faWarning} from "@fortawesome/free-solid-svg-icons";
import Preloader from "../../main/system/Preloader";

const {Text, Title} = Typography;

const UploadedDataTableList = ({data, tableFields, setTableFields, loading = false}) => {
    // Формируем активные колонки для выбора типов заголовков
    const activeColumns = useMemo(() => {
        return tableFields.headers.reduce((acc, header) => {
            acc[header.key] = header.type;
            return acc;
        }, {});
    }, [tableFields.headers]);

    // Вычисляем скрытые строки – для каждого файла и листа создаем объект с ключами строк и ожидаемыми значениями
    const hiddenRows = useMemo(() => {
        const _hiddenRows = {};
        tableFields.files?.forEach(({fileName, hiddenElements = []}) => {
            hiddenElements
                .filter(({type}) => type === 'row')
                .forEach(({sheet, key, value}) => {
                    const compositeKey = `${fileName}-${sheet}`;
                    if (!_hiddenRows[compositeKey]) {
                        _hiddenRows[compositeKey] = {};
                    }
                    _hiddenRows[compositeKey][key] = value;
                });
        });
        return _hiddenRows;
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

    // Глобальный массив несоответствий – собираем данные по всем скрытым строкам, для которых фактическое значение не совпадает с ожидаемым
    const mismatchRows = useMemo(() => {
        const mismatches = [];
        const identifierKey = tableFields.headers.find(header => header.type === 'identifier')?.key;
        if (!identifierKey || !data || data.length === 0) return mismatches;

        data.forEach(fileObj => {
            const fileName = fileObj.fileName;
            const sheets = fileObj.data;
            sheets.forEach(sheet => {
                const [headers, rows, sheetNameArr] = sheet;
                const sheetName = Array.isArray(sheetNameArr) ? sheetNameArr[0] : sheetNameArr;
                const compositeKey = `${fileName}-${sheetName}`;
                // Формируем dataSource аналогично основному рендеру
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
                // Если для данного листа есть скрытые строки – проверяем каждую
                if (hiddenRows[compositeKey]) {
                    Object.keys(hiddenRows[compositeKey]).forEach(rowKey => {
                        const expected = hiddenRows[compositeKey][rowKey];
                        const row = dataSource.find(r => String(r.key) === rowKey);
                        if (row && row[identifierKey] !== expected) {
                            mismatches.push({
                                fileName,
                                sheetName,
                                rowKey,
                                expected,
                                actual: row[identifierKey]
                            });
                        }
                    });
                }
            });
        });
        return mismatches;
    }, [data, tableFields, hiddenRows]);


    // Функция скрытия/отображения строки
    const toggleStrikethrough = (fileName, sheetName, record) => {
        setTableFields(prev => {
            let newFiles = [...prev.files];
            const identifierKey = tableFields.headers.find(item => item.type === 'identifier')?.key;
            const recordValue = identifierKey ? record[identifierKey] : undefined;
            const fileIndex = newFiles.findIndex(file => file.fileName === fileName);
            if (fileIndex !== -1) {
                newFiles[fileIndex] = {
                    ...newFiles[fileIndex],
                    hiddenElements: toggleHiddenElement(newFiles[fileIndex].hiddenElements, sheetName, record, recordValue),
                };
            } else {
                newFiles.push({
                    fileName,
                    hiddenElements: [{
                        key: record.key,
                        value: recordValue,
                        type: 'row',
                        sheet: sheetName
                    }],
                });
            }
            return {...prev, files: newFiles};
        });
    };

    // Функция для добавления/удаления элемента из hiddenElements
    const toggleHiddenElement = (hiddenElements = [], sheetName, record, recordValue) => {
        const exists = hiddenElements.some(el => el.key === record.key && el.type === 'row' && el.sheet === sheetName);
        return exists
            ? hiddenElements.filter(el => !(el.key === record.key && el.type === 'row' && el.sheet === sheetName))
            : [...hiddenElements, {
                key: record.key,
                value: recordValue,
                type: 'row',
                sheet: sheetName
            }];
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

    const handleHeaderChange = (colName, value) => {
        setTableFields(prev => {
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

    // Функция рендеринга таблицы для одного файла
    const renderTableForSheet = (sheet, fileName) => {
        const [headers, rows, sheetNameArr] = sheet;
        const sheetName = Array.isArray(sheetNameArr) ? sheetNameArr[0] : sheetNameArr;
        const compositeKey = `${fileName}-${sheetName}`;

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

        const identifierKey = tableFields.headers.find(header => header.type === 'identifier')?.key;

        // Здесь mismatchExists локально вычисляется для текущей таблицы, но все несоответствия будут собраны глобально в mismatchRows
        let localMismatch = false;
        if (identifierKey && hiddenRows && hiddenRows[compositeKey]) {
            localMismatch = dataSource.some(row => {
                if (hiddenRows[compositeKey][row.key] !== undefined) {
                    const expected = hiddenRows[compositeKey][row.key];
                    const actual = row[identifierKey];
                    return expected !== actual;
                }
                return false;
            });
        }

        const actionColumn = {
            title: '',
            key: 'action',
            className: 'text-center',
            render: (record) => (
                <Tooltip
                    title={
                        !Object.values(activeColumns).includes('identifier')
                            ? 'Выберете столбец реквизитов'
                            : hiddenRows && hiddenRows[compositeKey] && hiddenRows[compositeKey][record.key] !== undefined
                                ? 'Показать строку'
                                : 'Скрыть строку'
                    }
                    placement='right'
                >
                    <Button
                        type={!Object.values(activeColumns).includes('identifier') ? 'default' : 'text'}
                        onClick={() => toggleStrikethrough(fileName, sheetName, record)}
                        disabled={!Object.values(activeColumns).includes('identifier')}
                    >
                        <FontAwesomeIcon
                            icon={
                                hiddenRows && hiddenRows[compositeKey] && hiddenRows[compositeKey][record.key] !== undefined
                                    ? faEyeSlash
                                    : faEye
                            }
                        />
                    </Button>
                </Tooltip>
            ),
        };

        const columns = headers.map((colName) => {
            const listColumns = [
                {label: 'Реквизит', value: 'identifier', icon: faCreditCard, style: 'bg-purple'},
                {
                    label: 'Сумма',
                    value: 'pay_sum',
                    icon: faDollarSign,
                    style: 'border border-2 border-success bg-success text-light'
                },
                {
                    label: 'ФИО',
                    value: 'fio',
                    icon: faAddressCard,
                    style: 'bg-light border border-2 border-secondary-subtle'
                },
                {
                    label: 'Адрес',
                    value: 'address',
                    icon: faCompass,
                    style: 'bg-light border border-2 border-secondary-subtle'
                },
                {
                    label: 'Комментарий',
                    value: 'comment',
                    icon: faComment,
                    style: 'bg-light border border-2 border-secondary-subtle'
                },
                {
                    label: 'Доп.поле',
                    value: 'additional_field',
                    icon: faPlus,
                    style: 'bg-light border border-2 border-secondary-subtle'
                },
                {
                    label: 'Доп.поле 2',
                    value: 'additional_field_2',
                    icon: faPlus,
                    style: 'bg-light border border-2 border-secondary-subtle'
                },
                {
                    label: 'Доп.поле 3',
                    value: 'additional_field_3',
                    icon: faPlus,
                    style: 'bg-light border border-2 border-secondary-subtle'
                }
            ];
            return {
                title: () => (
                    <Select
                        allowClear
                        placeholder="(Пустое поле)"
                        style={{width: 180}}
                        listHeight={330}
                        value={activeColumns[colName] || undefined}
                        onChange={(value) => handleHeaderChange(colName, value)}
                        options={listColumns.map(column => ({
                            value: column.value,
                            label: (
                                <div className="d-flex ps-1 pe-1 align-items-center justify-content-between">
                                    <div className={`d-flex w-25 justify-content-center p-1 rounded ${column.style}`}>
                                        <FontAwesomeIcon size="lg" icon={column.icon}/>
                                    </div>
                                    <div className="d-flex ms-2 w-75 justify-content-center">
                                        {column.label}
                                    </div>
                                </div>
                            )
                        }))}
                    />
                ),
                dataIndex: colName,
                key: colName,
                className: `${!activeColumns[colName] ? 'table-cell-disabled' : ''} col-12`,
            };
        });

        return (
            <>
                <Table
                    size="small"
                    bordered
                    scroll={{ x: 'fit-content' }}
                    columns={[actionColumn, ...columns]}
                    dataSource={dataSource}
                    rowClassName={(record) => {
                        // Проверяем, есть ли несоответствие для данной строки
                        const isMismatch = mismatchRows.some(m =>
                            m.fileName === fileName &&
                            m.sheetName === sheetName &&
                            String(m.rowKey) === String(record.key)
                        );
                        if (isMismatch) return 'strikethrough-warning';
                        // Если строка скрыта, возвращаем класс для зачеркивания
                        if (hiddenRows && hiddenRows[compositeKey] && hiddenRows[compositeKey][record.key] !== undefined) {
                            return 'strikethrough';
                        }
                        return '';
                    }}
                />

            </>
        );
    };

    // Рендерим таблицы для каждого файла
    const renderSheetTable = (sheetData) => {
        return sheetData.map(fileObj => {
            const fileName = fileObj.fileName;
            const sheets = fileObj.data;
            if (sheets.length <= 1) {
                return (
                    <div key={fileName} className="d-flex flex-column mt-4">
                        <Divider>
                            <Title level={3}>{fileName}</Title>
                        </Divider>
                        {renderTableForSheet(sheets[0], fileName)}
                    </div>
                );
            } else {
                const tabItems = sheets.map(sheet => {
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
                            <div className="border rounded d-flex justify-content-center">
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
                            renderTableForSheet(sheet, fileName)
                        )
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
            {loading ? <Preloader/> : (data && data.length > 0 && (
                <>
                    {mismatchRows.length > 0 && (
                        <div className="mb-4 mt-4">
                            <Alert
                                message={<Title level={5}>Внимание! Обнаружены расхождения в скрытых строках!</Title>}
                                description="Ниже приведён список скрытых строк, значения которых отличаются от тех,
                                что были актуальны при последнем обновлении базы. Это может свидетельствовать о том,
                                что данные клиентов изменились, и шаблон необходимо скорректировать для актуальной
                                обработки информации."
                                type="warning"
                                showIcon
                                className="mb-2 bg-warning-subtle"
                                icon={<FontAwesomeIcon size="lg" icon={faWarning}/>}
                            />
                            <Table
                                className='mt-2'
                                dataSource={mismatchRows}
                                columns={[
                                    {title: 'Файл', dataIndex: 'fileName', key: 'fileName'},
                                    {title: 'Лист', dataIndex: 'sheetName', key: 'sheetName'},
                                    {title: 'Строка', dataIndex: 'rowKey', key: 'rowKey'},
                                    {title: 'Ожидаемое значение', dataIndex: 'expected', key: 'expected'},
                                    {title: 'Фактическое значение', dataIndex: 'actual', key: 'actual'}
                                ]}
                                rowKey={(record, index) => `${record.fileName}-${record.sheetName}-${record.rowKey}-${index}`}
                                pagination={false}
                            />
                        </div>
                    )}
                    {renderSheetTable(data)}
                </>
            ))}
        </ProtectedElement>
    );
};

export default UploadedDataTableList;
