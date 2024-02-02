import React, {useCallback, useEffect, useState} from 'react';
import Select from 'react-select';
import fetchData from '../database/DataFetcher';
import {useAlert} from '../../../contexts/AlertContext';

const UniversalSelect = ({
                             name,
                             isRequired,
                             placeholder,
                             className,
                             options,
                             fetchDataConfig = false,
                             isMulti,
                             isSearchable,
                             selectedOptions = [],
                             firstOptionSelected,
                             onSelectChange,
                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [optionsList, setOptionsList] = useState([]);
    const [closeMenuOnSelect, setCloseMenuOnSelect] = useState(!isMulti);
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const {showAlertMessage} = useAlert();
    const [selectedValue, setSelectedValue] = useState([]);
    const [valuesSet, setValuesSet] = useState(false);

    useEffect(() => {
        let mounted = true;
        let mappedOptions = [];

        const fetchDataFromDB = async () => {
            setIsLoading(true);
            try {
                const response = await fetchData(
                    fetchDataConfig.model,
                    fetchDataConfig.searchTerm
                );

                // После ответа сервера формируем массив опций для селектора
                mappedOptions.push(
                    ...response.data.map((item) => ({
                        value: item.id,
                        label: `${item.name}   ${item.id}`,
                    }))
                );

            } catch (error) {
                showAlertMessage({
                    type: 'error',
                    text: 'Ошибка при получении данных: ' + error.message,
                });
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setValuesSet(true);
                }
            }
        };

        // Получаем записи с базы для массива опций
        if (fetchDataConfig) {
            fetchDataFromDB();
        }

        // Обедняем переданные опций из родительского класса, если такие есть, с массивом из базы данных
        if (Array.isArray(options) && options.length > 0) {
            mappedOptions.push(...options);
            setValuesSet(true);
        }

        // Получившийся массив выставляем в качестве опций для селектора
        setOptionsList(mappedOptions);
        return () => {
            mounted = false;
        };

    }, [valuesSet]);


    const setAndNotifyChange = useCallback(
        (newValue) => {
            let updatedValue;
            let optionsListArray = [];

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

            // Если условие срабатывает ставим выбранным только 1 элемент, setIsMultiSelect(false) если нет выставляем стандартное значение
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
                    callBackValues = Array.isArray(updatedValue) && updatedValue.length > 0 ? updatedValue[0].value : updatedValue.value;

                }

                onSelectChange(callBackValues, name);
            }
        },

        [onSelectChange, optionsList, isMulti]
    );


    useEffect(() => {

        //Установить заранее выбранные значения
        if (
            selectedOptions &&
            selectedOptions.length > 0 &&
            optionsList.length > 0
        ) {
            const matchingOptions = optionsList.filter(option => selectedOptions.includes(option.value));
            setAndNotifyChange(matchingOptions);
        }
        //Установить первое значение из списка
        if (
            (!selectedOptions || selectedOptions.length === 0) &&
            firstOptionSelected &&
            optionsList.length > 0
        ) {
            const initialValue = [optionsList[0]];
            setAndNotifyChange(initialValue);
        }

    }, [valuesSet]);

    return (
        <Select
            name={name}
            closeMenuOnSelect={closeMenuOnSelect}
            required={isRequired}
            placeholder={placeholder}
            className={className}
            options={optionsList}
            isLoading={isLoading}
            isMulti={isMultiSelect}
            isSearchable={isSearchable}
            value={selectedValue}
            onChange={(newValue) => setAndNotifyChange(newValue)}
        />
    );
};

export default UniversalSelect;
