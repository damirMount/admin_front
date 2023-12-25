// useSortableData.js
import { useState } from 'react';

const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = items.slice().sort((a, b) => {
        if (sortConfig && a.hasOwnProperty(sortConfig.key) && b.hasOwnProperty(sortConfig.key)) {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (typeof valA !== 'string') {
                valA = String(valA);
            }

            if (typeof valB !== 'string') {
                valB = String(valB);
            }

            const comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base', numeric: true });

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'ascending';

        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

export default useSortableData;
