import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { parseCookies } from 'nookies';
import Link from 'next/link';

const MultiSelectWithSearch = ({ apiUrl, required, name, onSelectChange, defaultValue }) => {
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
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [apiUrl]);

    if (isLoading || options.length === 0) {
        return null; // Возврат null, если данные еще загружаются или options пустой
    }

    const defaultOptions = defaultValue.map((item) => {
        return options.find((opt) => opt.value === item.id);
    });

    const handleSelectChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions);
        const selectedValues = selectedOptions.map((option) => option.value);
        onSelectChange(selectedValues);
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <Select
                value={selectedOptions}
                onChange={handleSelectChange}
                options={options}
                isMulti
                isSearchable
                placeholder="Выберите опции"
                required={required}
                name={name}
            />
            {defaultOptions.length > 0 && (
                <sup>
                    Выбранные файлы реестров <br />
                    {defaultOptions.map((option) => (
                        <span key={option.value}>
              <a href={`/registry/registry-file/edit-registry-file/${option.value}`}>
                {option.label}
              </a>
              <br />
            </span>
                    ))}
                </sup>
            )}
        </div>
    );
};

export default MultiSelectWithSearch;
