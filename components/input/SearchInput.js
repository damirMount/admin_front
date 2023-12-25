// SearchInput.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchInput = ({ onSearchSubmit }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit(searchTerm);
    };

    useEffect(() => {
        // Вы можете добавить здесь дополнительную логику, если необходимо
    }, [searchTerm]);

    return (
        <form onSubmit={handleSearchSubmit} className="d-flex justify-content-end">
            <input
                className="form-control"
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <button className="btn btn-purple d-flex position-absolute" type="submit">
                <FontAwesomeIcon icon={faSearch} className="icon-search" />
            </button>
        </form>
    );
};

export default SearchInput;
