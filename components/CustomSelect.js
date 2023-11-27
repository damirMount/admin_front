import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, required, name, onSelectChange, defaultValue, selectedValue, className }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    useEffect(() => {
        // Обновляем выбранное значение в зависимости от переданного selectedValue
        if (selectedValue) {
            const option = options.find((option) => option.value === selectedValue.value);
            setSelectedOption(option);
        }
    }, [selectedValue, options]);

    const handleSelectChange = (selectedOption) => {
        onSelectChange(selectedOption ? selectedOption.value : '');
    };

    return (
        <Select
            defaultValue={defaultValue}
            value={selectedValue}  // Используйте selectedValue вместо selectedOption
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
