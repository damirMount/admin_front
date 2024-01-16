import React, {useState} from 'react';

const BooleanSelect = ({selectedValue, name}) => {
    const [value, setValue] = useState(selectedValue);

    const handleSelection = (newValue) => {
        setValue(newValue);
    };

    return (
        <div>
            <button
                className={`boolean-option ${value ? 'active' : ''}`}
                onClick={() => handleSelection(true)}
                name={name}
            >
                Да
            </button>
            <button
                className={`boolean-option ${!value ? 'active' : ''}`}
                onClick={() => handleSelection(false)}
                name={name}
            >
                Нет
            </button>
            <style jsx>{`
        .boolean-option {
          padding: 8px 16px;
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fff;
          cursor: pointer;
        }

        .boolean-option.active {
          background-color: #0069d9;
          color: #fff;
        }
      `}</style>
        </div>
    );
};

export default BooleanSelect;
