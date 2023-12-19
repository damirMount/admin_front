import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, required, name, onSelectChange, selectedValue, className }) => {
    const [currentSelectedValue, setCurrentSelectedValue] = useState(null);

    useEffect(() => {
        // При появлении селектора устанавливаем выбранное значение
        if (selectedValue !== null && selectedValue !== undefined) {
            const option = options.find((opt) => opt.value === selectedValue);
            setCurrentSelectedValue(option || null);
        } else if (!currentSelectedValue && options.length > 0) {
            // Если selectedValue не задан и текущее выбранное значение отсутствует, устанавливаем первый элемент options
            setCurrentSelectedValue(options[0]);
            onSelectChange(options[0].value);
        }
    }, [options, selectedValue, currentSelectedValue, onSelectChange]);

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
