import React, { useState } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, required, name, onSelectChange, defaultValue }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelectChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        onSelectChange(selectedOption ? selectedOption.value : '');
    };
    return (
        <Select
            defaultValue={defaultValue}
            onChange={handleSelectChange}
            options={options}
            isSearchable={false}
            placeholder="Выберите опцию"
            required={required}
            name={name}
        />
    );
};

export default CustomSelect;
