import React from "react";

const ValueCountCell = (value) => {
    function countServices(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} Значений`;
        } else if (lastDigit === 1) {
            return `${value.length} Значение`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} Значения`;
        } else {
            return `${value.length} Значений`;
        }
    }

    return (
        <span className='text-nowrap'>
            {`${countServices(value)}`}
        </span>
    );
};

export default ValueCountCell;
