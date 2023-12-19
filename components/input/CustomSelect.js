import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, required, name, onSelectChange, selectedValue, className }) => {
    const [currentSelectedValue, setCurrentSelectedValue] = useState(null);
    console.log( '3r23r',selectedValue)
    useEffect(() => {
        // При появлении селектора устанавливаем выбранное значение
        if (selectedValue !== null && selectedValue !== undefined) {
            const option = options.find((opt) => opt.value === selectedValue);
            setCurrentSelectedValue(option || null);
        }
    }, [options, selectedValue]);

    const handleSelectChange = (selectedOption) => {
        setCurrentSelectedValue(selectedOption);
        onSelectChange(selectedOption.value);
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
