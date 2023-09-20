import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGripVertical, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

function RegistryTable(props) {
    const { getRows, onUpdateData } = props;  // Получаем переданные данные из props

    const [rows, setRows] = useState(getRows);

    const [dropIndex, setDropIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleTableInputChange = (index, field, value) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index][field] = value;
            return updatedRows;
        });

    };

    const handleTableCheckboxChange = (index) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index].isActive = !updatedRows[index].isActive;
            return updatedRows;
        });
    };

    const handleAddColumn = () => {
        setRows((prevRows) => [
            ...prevRows,
            { isActive: true, field: '', tableHeader: '' },
        ]);
    };

    const handleRemoveColumn = (index) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows.splice(index, 1);

            // Проверяем, сколько активных строк сейчас существует
            const activeRowCount = updatedRows.filter((row) => row.isActive).length;

            // Если осталась только одна активная строка, не удаляем её
            if (activeRowCount < 1) {
                return prevRows;
            }

            return updatedRows;
        });
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        setIsDragging(true);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDropIndex(index);
    };

    const handleDrop = (e, toIndex) => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData('text/plain');

        setIsDragging(false);
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            const [movedRow] = updatedRows.splice(fromIndex, 1);
            updatedRows.splice(toIndex, 0, movedRow);
            return updatedRows;
        });
    };

    const handleDragLeave = () => {
        setDropIndex(null);
    };

    useEffect(() => {
        onUpdateData(rows); // Вызываем функцию onUpdateData и передаем ей данные rows
    }, [rows, onUpdateData]);



    return (
        <div>
            <label>
                Внимание! Формат DBF имеет ограничение в названии столбцов! Можно ввести максимум 10
                символов на Английском или же 5 на Русском
            </label>
        <table className="table table-bordered mt-4">
            <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">Таблица в базе</th>
                <th scope="col">Название таблицы в реестре</th>
                <th scope="col"></th>
            </tr>
            </thead>
            <tbody>
            {rows.map((row, index) => (
                <tr
                    key={index}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index, 'before')}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragLeave={handleDragLeave}
                    className={isDragging ? 'active' : ''}
                    style={{ borderBottom: dropIndex === index ? '2px solid #532C59' : '' }}
                >
                    <td scope="row" className="table-center table-buttons">
                        <label>
                            <FontAwesomeIcon icon={faGripVertical} size="xl" className="me-2 cursor-grab" />
                        </label>
                        <input
                            id={row.field}
                            type="checkbox"
                            className="btn-checked btn-purple"
                            checked={row.isActive}
                            onChange={() => handleTableCheckboxChange(index)}
                        />
                        <label className="check" htmlFor={row.field}>
                            {row.isActive && <FontAwesomeIcon className="w-100" icon={faCheck} size="lg" />}
                        </label>
                    </td>
                    <td className="fw-bold">
                        <input
                            required
                            type="text"
                            className="w-100 fields-input fw-bold "
                            value={row.field}
                            onChange={(event) => handleTableInputChange(index, 'field', event.target.value)}
                            disabled={!row.isActive}
                        />
                    </td>
                    <td>
                        <input
                            required
                            type="text"
                            className="w-100 fields-input"
                            value={row.tableHeader}
                            onChange={(event) => handleTableInputChange(index, 'tableHeader', event.target.value)}
                            disabled={!row.isActive}
                        />
                    </td>
                    <td>
                        <button
                            type="button"
                            className="btn btn-purple"
                            onClick={() => handleRemoveColumn(index)}
                            disabled={!row.isActive}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} size="xl" />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-purple mt-2" onClick={handleAddColumn}>
            Добавить столбец
        </button>
    </div>
        </div>
    );
}

export default RegistryTable;
