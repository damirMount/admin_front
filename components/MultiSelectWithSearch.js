import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import Select from 'react-select';

const MultiSelectWithSearch = ({ apiUrl, placeholder, required, name, onSelectChange, className, defaultValue = [] }) => {
    const [options, setOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOptions = async () => {
            try {
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

                // Initialize selectedOptions based on defaultValue
                const defaultOptions = options.filter((option) => defaultValue.includes(option.value));
                setSelectedOptions(defaultOptions);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [apiUrl, defaultValue]);

    const handleSelectChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions);
        const selectedValues = selectedOptions.map((option) => option.value);
        onSelectChange(selectedValues);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (isLoading || options.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Select
                value={selectedOptions}
                onChange={handleSelectChange}
                options={options}
                isMulti
                className={className}
                isSearchable
                placeholder={placeholder}
                required={required}
                name={name}
            />
        </div>
    );
};


export default MultiSelectWithSearch;
