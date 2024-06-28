import React, { useEffect, useState } from "react";
import { Button, Divider, Dropdown, Empty, Input, Select, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cloneDeep } from "lodash";
import UniqueKeyGenerator from "../../system/UniqueKeyGenerator";
import ValueCountCell from "./ValueCountCell";

const FieldTypeCell = ({ record, text, data, oldFormData, setActiveInput, selectedRowKey, onChange }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (!dropdownOpen) {
            setActiveInput(null);
        }
    }, [dropdownOpen, setActiveInput]);

    const handleTableInputChange = (value, record, name) => {
        const newData = cloneDeep(data);

        newData.fields = data.fields.map(item => {
            if (item.key === record.key) {
                return { ...item, [name]: value };
            }

            return item;
        });

        onChange(newData);
    };

    const addNewRow = () => {
        const newData = cloneDeep(data);

        newData.fields = newData.fields.map(item => {
            if (item.key === record.key) {
                return {
                    ...item,
                    regularValueList: [
                        ...item.regularValueList,
                        { originalValue: '', newValue: '', key: UniqueKeyGenerator() }
                    ]
                };
            }

            return item;
        });

        onChange(newData);
    };

    const updateRowInput = (value, record, name, key) => {
        const newData = cloneDeep(data);

        newData.fields = newData.fields.map(item => {
            if (item.key === record.key) {
                const updatedRegularValueList = item.regularValueList.map(listItem => {
                    if (listItem.key === key) {
                        return {
                            ...listItem,
                            [name]: value
                        };
                    }

                    return listItem;
                });

                return {
                    ...item,
                    regularValueList: updatedRegularValueList
                };
            }

            return item;
        });

        onChange(newData);
    };

    const deleteRow = (recordKey, itemKey) => {
        const newData = cloneDeep(data);

        newData.fields = newData.fields.map(field => {
            if (field.key === recordKey) {
                return {
                    ...field,
                    regularValueList: field.regularValueList.filter(listItem => listItem.key !== itemKey)
                };
            }

            return field;
        });

        onChange(newData);
    };

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    if (record.key === selectedRowKey) {
        return (
            <span className="d-flex justify-content-between align-items-center">
                {record.regularValueType === 'value' && (
                    <Input
                        defaultValue={text}
                        disabled={data && data.fields && !data.formats.length > 0}
                        placeholder="(Пусто)"
                        onChange={(event) => handleTableInputChange(event.target.value, record, 'regularValue')}
                        onFocus={() => setActiveInput(record.key)}
                        onBlur={() => setActiveInput(null)}
                    />
                )}
                {record.regularValueType === 'list' && (
                    <Dropdown
                        overlayInnerStyle={{ pointerEvents: 'auto' }}
                        trigger='click'
                        disabled={!(data && data.fields && data.formats && data.formats.length > 0)}
                        placement='bottomLeft'
                        open={dropdownOpen}
                        onOpenChange={(open) => setDropdownOpen(open)}
                        menu={{
                            items: [{
                                label: (
                                    <div className='user-select-none' onClick={stopPropagation}>
                                        <Divider>
                                            <h6>Список</h6>
                                        </Divider>

                                        {record.regularValueList.length > 0 ? (
                                            <>
                                                <div className='d-flex justify-content-between me-2'>
                                                    <label className='w-50'>Значение</label>
                                                    <label className='w-50'>Результат</label>
                                                </div>
                                                <div className='ant-dropdown-menu-item-container'>
                                                    {record.regularValueList.map((listItem, index) => (
                                                        <div key={listItem.key}
                                                             className='d-flex justify-content-between align-items-center mt-1 '>
                                                            <Input
                                                                defaultValue={listItem.originalValue}
                                                                className={`me-2 ${
                                                                    oldFormData.fields.some(
                                                                        fieldValue => fieldValue.key === record.key
                                                                            && fieldValue.regularValueList.some(
                                                                                value => value.key === listItem.key
                                                                                    && value.originalValue === listItem.originalValue
                                                                            )
                                                                    ) ? '' : 'fst-italic text-decoration-underline'
                                                                }`}
                                                                placeholder="Изначальное значение"
                                                                onFocus={() => setActiveInput(record.key)}
                                                                onChange={(event) => updateRowInput(event.target.value,
                                                                    record, 'originalValue', listItem.key)}
                                                                onClick={stopPropagation}
                                                            />
                                                            <FontAwesomeIcon icon={faAnglesRight} />
                                                            <Input
                                                                defaultValue={listItem.newValue}
                                                                className={`me-2 ${
                                                                    oldFormData.fields.some(
                                                                        fieldValue => fieldValue.key === record.key
                                                                            && fieldValue.regularValueList.some(
                                                                                value => value.key === listItem.key
                                                                                    && value.newValue === listItem.newValue
                                                                            )
                                                                    ) ? '' : 'fst-italic text-decoration-underline'
                                                                }`}
                                                                placeholder="Итоговое значение"
                                                                onFocus={() => setActiveInput(record.key)}
                                                                onChange={(event) => updateRowInput(event.target.value,
                                                                    record, 'newValue', listItem.key)}
                                                                onClick={stopPropagation}
                                                            />
                                                            <Tooltip title='Удалить' placement='right'>
                                                                <Button
                                                                    type='default'
                                                                    className="ms-2 me-2 color-purple border"
                                                                    icon={<FontAwesomeIcon className='ms-2 me-2'
                                                                                           icon={faXmark} />}
                                                                    onClick={() => deleteRow(record.key, listItem.key)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                        )}
                                        <Divider>
                                            <Button onClick={addNewRow} type='text'
                                                    className='btn-purple d-flex align-items-center'
                                                    icon={<FontAwesomeIcon icon={faPlus} />}>
                                                Добавить
                                            </Button>
                                        </Divider>
                                    </div>
                                ),
                            }],
                        }}
                    >
                        <Button
                            onClick={() => {
                                if (dropdownOpen) {
                                    setActiveInput(null);
                                } else {
                                    setActiveInput(record.key);
                                }
                                setDropdownOpen(!dropdownOpen);
                            }}
                            type='text'
                            className='color-purple border w-100'
                        >
                            {ValueCountCell(record.regularValueList)}
                        </Button>
                    </Dropdown>
                )}

                <Tooltip title='Тип данных'>
                    <Select
                        className='ms-2'
                        defaultValue={record.regularValueType}
                        disabled={!(data && data.fields && data.formats && data.formats.length > 0)}
                        onChange={(value) => {
                            setActiveInput(null);
                            handleTableInputChange(value, record, 'regularValueType');
                        }}
                        onFocus={() => setActiveInput(record.key)}
                        onBlur={() => setActiveInput(null)}
                        options={[
                            { value: 'value', label: 'Значение' },
                            { value: 'list', label: 'Список' },
                        ]}
                    />
                </Tooltip>
            </span>
        );
    }

    return (
        <span className={
            oldFormData.fields.some(fieldValue => fieldValue.key === record.key && (
                (record.regularValueType === 'value' && fieldValue.regularValue === text) ||
                (record.regularValueType === 'list' && JSON.stringify(fieldValue.regularValueList) === JSON.stringify(record.regularValueList))
            ))
                ? '' : 'fst-italic text-decoration-underline'
        }>{
            record.regularValueType === 'list'
                ? ValueCountCell(record.regularValueList)
                : text ? text : <span className="text-secondary">(Пусто)</span>
        }
</span>

    )
};

export default FieldTypeCell;
