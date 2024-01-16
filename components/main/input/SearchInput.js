import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

const SearchInput = ({onSearchSubmit}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit(searchTerm);
    };

    useEffect(() => {

    }, [searchTerm]);

    return (
        <form onSubmit={handleSearchSubmit} className="d-flex justify-content-end">
            <div className="d-flex">
                <input
                    className="form-control input-search"
                    type="search"
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-purple d-flex btn-search" type="submit">
                    <FontAwesomeIcon icon={faSearch} className="input-btn"/>
                </button>
            </div>
        </form>
    );
};

export default SearchInput;
