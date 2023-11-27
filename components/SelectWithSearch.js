import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { parseCookies } from 'nookies';

const SelectWithSearch = ({ apiUrl, options: staticOptions, required, name, onSelectChange, defaultValue }) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                if (staticOptions && apiUrl && staticOptions.length > 0) {
                    setOptions(staticOptions);
                    setIsLoading(false);
                } else {
                    const cookies = parseCookies();
                    const authToken = JSON.parse(cookies.authToken).value;
                    const response = await fetch(apiUrl, {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch options');
                    }

                    const data = await response.json();

                    const options = data.map((item) => ({
                        value: item.id,
                        label: item.name + '   ' + item.id,
                    }));

                    setOptions(options);
                    setIsLoading(false);
                }
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [apiUrl, staticOptions]);

    const handleSelectChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        onSelectChange(selectedOption ? selectedOption.value : '');
    };

    const selectedDefaultValue = options.find((option) => option.value === defaultValue);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Select
            value={selectedDefaultValue}
            onChange={handleSelectChange}
            options={options}
            isSearchable={true}
            placeholder="Выберите опцию"
            required={required}
            name={name}
        />
    );
};

export default SelectWithSearch;
