import React, {useEffect, useState} from 'react';
import {faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ActionButtons from "./ActionButtons";
import debounce from 'lodash/debounce';


const Table = ({data, configTable = null, tableHeaders, onSort}) => {
    const [sortConfig, setSortConfig] = useState('');
    const debouncedSort = debounce(onSort, 100);

    let [actionButtonsConfig, setActionButtonsConfig] = useState(null);

    useEffect(() => {
        if (configTable) {
            setActionButtonsConfig(configTable.find(item => item.key === 'actionButtons'));
        }
    }, [configTable]);

    if (actionButtonsConfig) {
        const newTableHeader = {key: 'action_buttons', body: ActionsButtonsCell, sortable: false};
        const existingHeader = tableHeaders.find(header => header.key === newTableHeader.key);
        if (!existingHeader) {
            tableHeaders.push(newTableHeader);
        }

        function ActionsButtonsCell(props) {

            const actionButtonsConfig = configTable.find(item => item.key === 'actionButtons');

            return (
                <ActionButtons buttonsLinks={actionButtonsConfig.links} props={props}/>

            );
        }
    }
    const requestSort = (column) => {
        let direction = 'asc';

        if (sortConfig.column === column) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';

            const count = sortConfig.count + 1;

            if (count >= 3) {
                column = null;
                direction = null;
                setSortConfig({column: null, direction: null, count: 0});
            } else {
                setSortConfig({column, direction, count});
            }
        } else {
            console.log(column);
            setSortConfig({column, direction: 'asc', count: 1});
        }

        debouncedSort({column, direction});
    };


    // Функция для отображения строки в таблице
    const renderRow = (rowData, index) => (
        <tr key={index}>
            {tableHeaders.map(({key, body}) => (
                <td key={key}>
                    {body ? (typeof body === 'function' ? body(rowData) : body) : (rowData[key])}
                </td>
            ))}
        </tr>);


    // Функция для отображения заголовка таблицы
    const renderTableHeaders = () => (
        <tr>
            {tableHeaders.map(({key, label, sortable = true, headerClass}) => (
                <th
                    key={key}
                    className={`${sortable ? 'user-select-none table-sort-button' : ''} ${headerClass ? headerClass : ''}${!/(^|\s)col-\S+/.test(headerClass) ? ' ' : ''}`}
                    onClick={() => sortable && requestSort(key)}>

                    <div className="w-100 small d-flex justify-content-between flex-nowrap align-items-center">
                        {label}
                        {sortable ? renderSortIcons(key) : ''}
                    </div>
                </th>
            ))}
        </tr>
    );

    // Функция для отображения иконок сортировки
    const renderSortIcons = (columnKey) => {
        const isSorting = sortConfig.column === columnKey && sortConfig.count > 0;

        const renderIcon = (icon, isTransparent) => (
            <div className='h-0'>
                <FontAwesomeIcon icon={icon} className={isTransparent ? "opacity-50" : ""}/>
            </div>
        );

        if (isSorting) {
            return (
                <div className="table-sort-block">
                    {renderIcon(faSortUp, sortConfig.direction === 'desc')}
                    {renderIcon(faSortDown, sortConfig.direction === 'asc')}
                </div>
            );
        }

        return (
            <div className="table-sort-block table-sort-icons">
                {renderIcon(faSortUp, true)}
                {renderIcon(faSortDown, true)}
            </div>);


    };


    return (
        <div className="border">
            <table className="table table-bordered m-0 ">
                <thead>
                {renderTableHeaders()}
                </thead>
                {data && data.length > 0 ? (
                    <tbody>
                    {data.map(
                        (row, index) => (
                            <React.Fragment key={index}>
                                {
                                    renderRow(row, index)
                                }
                            </React.Fragment>
                        )
                    )
                    }
                    </tbody>
                ) : (
                    <tbody>
                    <tr>
                        <td colSpan={tableHeaders.length} className="text-center">
                            Нет данных
                        </td>
                    </tr>
                    </tbody>
                )}
            </table>
        </div>
    );
};

export default Table;
