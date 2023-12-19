import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, required, name, onSelectChange, defaultValue, className }) => {
    const [currentSelectedValue, setCurrentSelectedValue] = useState(null);

    useEffect(() => {
        if (defaultValue) {
            // Если есть defaultValue, устанавливаем его в качестве выбранного значения
            const option = options.find((opt) => opt.value === defaultValue);
            setCurrentSelectedValue(option || null);
        } else if (!currentSelectedValue && options.length > 0) {
            // Если defaultValue не задан, устанавливаем первое значение в статус selected при загрузке
            setCurrentSelectedValue(options[0]);
            onSelectChange(options[0].value);
        }
    }, [options, currentSelectedValue, onSelectChange, defaultValue]);

    const handleSelectChange = (selectedOption) => {
        setCurrentSelectedValue(selectedOption);
        onSelectChange(selectedOption ? selectedOption.value : '');
    };

    return (
        <Select
            value={currentSelectedValue}
            onChange={handleSelectChange}
            options={options}
            isSearchable={false}
            placeholder="Выберите опцию"
            required={required}
            name={name}
            className={className}
        />
    );
};

export default CustomSelect;
