import React from "react";

export const FAVORITE_DEALER_IDS = [770, 2643, 2642, 3471, 2579, 3501, 3270, 3067, 3287, 2378, 3287, 2168, 2245];

export const FIELDS_TO_SUM = [
    'count', 'total', 'real_pay', 'real_pay_rur', 'commission', 'reduce', 'comDlr', 'pDlr', 'pFed', 'netWriteOff', 'income'
];

export const formatCurrency = (value, currency = "KGS") => {
    const num = Number(value || 0);
    return (
        <span className="fw-bold">
            {num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-muted small ms-1">{currency}</span>
        </span>
    );
};