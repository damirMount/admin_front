import React from 'react';

const FormTextarea = ({id, className, name, value, onChange, rows, cols, required, readOnly = false}) => {
    return (<div className={className}>
        <textarea
            id={id}
            className={className}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            cols={cols}
            required={required}
            readOnly={readOnly}
        >
        </textarea>
        <style jsx>{`
          .text-field {
            width: 100%;
            //padding: 0.5rem;
            border-radius: 4px;
            border-color: #ccc;
            font-family: sans-serif;
            resize: vertical;
            background-color: #f8f8f8;
            color: #333;
            transition: border-color 0.3s ease;
          }

          .text-field:focus {
            outline: none;
            border-color: #0069d9;
            box-shadow: 0 0 0 2px #0069d9;
          }
        `}
        </style>
    </div>);
};

export default FormTextarea;
