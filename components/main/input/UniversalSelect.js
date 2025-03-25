import React, {useCallback, useEffect, useState} from 'react';
import Select from 'react-select';
import fetchData from '../database/DataFetcher';
import {useAlert} from '../../../contexts/AlertContext';
import CreatableSelect from "react-select/creatable";
import validator from 'validator';
import {useSession} from "next-auth/react";
import {Typography} from "antd";


const UniversalSelect = ({
                             name,
                             label,
                             isRequired,
                             placeholder,
                             className,
                             options = [],
                             fetchDataConfig = false,
                             isMulti,
                             isClearable,
                             isSearchable,
                             isDisabled = false,
                             selectedOptions = [],
                             firstOptionSelected,
                             onSelectChange,
                             createNewValues,
                             type,
                             style
                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [optionsList, setOptionsList] = useState([]);
    const [selectType, setSelectType] = useState('');
    const [closeMenuOnSelect] = useState(!isMulti);
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const {openNotification} = useAlert();
    const [selectedValue, setSelectedValue] = useState([]);
    const [valuesSet, setValuesSet] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const {data: session} = useSession(); // Получаем сессию
    const {Text} = Typography;

    const getOptionData = async () => {
        let dataLoaded = false;
        let optionsLoaded = false;
        let mappedOptions = [];

        try {
            if (fetchDataConfig) {
                setIsLoading(true);
                const response = await fetchData(fetchDataConfig, session);
                mappedOptions = response.data.map((item) => ({
                    value: item.id,
                    label: `${item.name}   ${item.id}`,
                }));
                dataLoaded = true;
            } else {
                dataLoaded = true;
            }

            if (Array.isArray(options) && options.length > 0) {
                mappedOptions.push(...options);
                optionsLoaded = true;
            } else {
                optionsLoaded = true;
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Ошибка при получении данных: ' + error.message,
            });
        } finally {
            setIsLoading(false);
            // После завершения загрузки данных и опций вызываем функцию updateOptions
            updateOptions(dataLoaded, optionsLoaded, mappedOptions);
        }
    };

    const updateOptions = (dataLoaded, optionsLoaded, mappedOptions) => {
        if (dataLoaded && optionsLoaded) {
            const combinedOptions = [...options, ...mappedOptions].filter((option, index, self) =>
                    index === self.findIndex((t) => (
                        t.value === option.value && t.label === option.label
                    ))
            );
            setOptionsList(combinedOptions);
            setValuesSet(true);
        }
    };


    const selectValueSet = () => {
        //Установить заранее выбранные значения
        if (
            selectedOptions &&
            selectedOptions.length > 0 &&
            selectedOptions[0] !== undefined &&
            optionsList.length > 0
        ) {
            const matchingOptions = optionsList.filter(option => selectedOptions.includes(option.value));
            setAndNotifyChange(matchingOptions);
        }
        //Установить первое значение из списка
        if (
            (!selectedOptions || selectedOptions.length < 0 || selectedOptions[0] === undefined) &&
            firstOptionSelected &&
            optionsList.length > 0
        ) {
            const initialValue = [optionsList[0]];
            setAndNotifyChange(initialValue);
        }

    }

    const returnSelectedOption = (newValue) => {
        let updatedValue;
        let optionsListArray = [];
        setErrorMessage('')

        const validateInput = (value) => {
            // Если значение является массивом, проверяем каждый элемент массива
            if (Array.isArray(value)) {
                return value.every(item => validateInput(item));
            }

            // Если значение является объектом, извлекаем его значение
            if (typeof value === 'object' && value !== null) {
                value = value.value;
            }

            // Преобразуем значение к строке, чтобы убедиться, что оно всегда представлено строкой
            const stringValue = String(value);

            // Проверяем значение на валидность в зависимости от типа
            switch (selectType) {
                case 'email':
                    return validator.isEmail(stringValue);
                case 'url':
                    return validator.isURL(stringValue);
                case 'number':
                    return validator.isNumeric(stringValue);
                case 'alpha':
                    return validator.isAlpha(stringValue);
                // Добавьте другие типы валидации, если необходимо
                default:
                    console.log('Unknown type:', selectType);
                    return false;
            }
        };

        if (newValue && createNewValues && type && !validateInput(newValue)) {
            return setErrorMessage(`Введенное значение не является ${type}`);
        }


        // Проверка есть ли у полученного элемента значение isSelectOne == true. Если да то записываем в optionsListArray
        if (Array.isArray(newValue)) {
            newValue.forEach(item => {
                if (item.isSelectOne && !optionsListArray.some(option => option.value === item.value)) {
                    optionsListArray.push(item);
                }
            });
        } else {
            if (newValue.isSelectOne && !optionsListArray.some(option => option.value === newValue.value)) {
                optionsListArray.push(newValue);
            }
        }

        // Если условие срабатывает ставим выбранным только 1 элемент, setIsMultiSelect(false) если нет
        // выставляем стандартное значение
        if (
            isMulti &&
            optionsList.length > 0 &&
            optionsListArray &&
            optionsListArray.length > 0
        ) {
            setIsMultiSelect(false);
            updatedValue = optionsListArray;
        } else {
            setIsMultiSelect(isMulti);
            updatedValue = newValue;
        }
        setSelectedValue(updatedValue);

        // Если true возвращаем ответ в родительский класс, в виде массива со значениями value
        if (onSelectChange) {
            let callBackValues

            // Если true возвращаем как массив, если нет, то как значение
            if (isMulti) {
                callBackValues = Array.isArray(updatedValue)
                    ? updatedValue.map(item => item.value)
                    : [updatedValue.value];
            } else {
                callBackValues = Array.isArray(updatedValue) && updatedValue.length > 0
                    ? updatedValue[0].value : updatedValue.value;

            }

            onSelectChange(callBackValues, name);
        }
    }

    useEffect(() => {
        getOptionData()
    }, []);

    useEffect(() => {
        if (valuesSet) {
            selectValueSet();
        }
    }, [valuesSet]);

    const setAndNotifyChange = useCallback((newValue) => {
            returnSelectedOption(newValue)
        }, [onSelectChange, valuesSet]
    );

    const Selector = createNewValues ? CreatableSelect : Select;

// Код для отображения компонента после загрузки данных
    return (
        <div className="d-flex flex-column form-group w-100" style={style}>
            <Text type="secondary" htmlFor={name} className="mb-1">
                {label}
            </Text>
            <Selector
                name={name}
                closeMenuOnSelect={closeMenuOnSelect}
                required={isRequired}
                className={className}
                placeholder={placeholder}
                options={optionsList}
                isLoading={isLoading || !valuesSet}
                isMulti={isMultiSelect}
                isSearchable={isSearchable}
                value={selectedValue}
                isDisabled={isDisabled}
                isClearable={isClearable}
                onChange={(newValue) => setAndNotifyChange(newValue)}
            />
            {createNewValues && type && (
                <p className="text-danger">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}


export default UniversalSelect;
