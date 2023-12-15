import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import Select from 'react-select';

const MultiSelectWithSearch = ({ apiUrl, placeholder, required, name, onSelectChange, className, defaultValue = [], onlyDefaultValue = false, selectedRegistry, selectedLastRegistry = [], selectedValue = [] }) => {
    const [options, setOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const handleSelectChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions);

            const selectedValues = selectedOptions.map((option) => option.value);
            onSelectChange(selectedValues);
    };

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;

                // Construct the URL based on the onlyDefaultValue prop
                let url = apiUrl;

                if (onlyDefaultValue) {
                    const queryParams = defaultValue.map((value) => `value[]=${encodeURIComponent(value)}`).join('&');
                    url += `?column=id&${queryParams}`;
                }

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch options');
                }

                const data = await response.json();

                const formattedOptions = data.map((item) => ({
                    value: item.id,
                    label: item.name + '   ' + item.id,
                }));

                setOptions(formattedOptions);
                setIsLoading(false);

                // Initialize selectedOptions based on defaultValue
                if (selectedRegistry === selectedLastRegistry) {
                    const defaultOptions = formattedOptions.filter((option) => selectedValue.includes(option.value));
                    setSelectedOptions(defaultOptions);
                } else {
                    const defaultOptions = formattedOptions.filter((option) => defaultValue.includes(option.value));
                    setSelectedOptions(defaultOptions);
                }
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [apiUrl, defaultValue, onlyDefaultValue]);



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
