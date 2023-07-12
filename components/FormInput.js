import React from 'react';

const FormInput = ({type, id, name, value, onChange, accept, required, className}) => {
    return (
        <div>
            <input
                type={type}
                className={className}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                accept={accept}
                required={required}
            />
            <style jsx>{`
              .input-field {
                width: 100%;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
                border-radius: 4px;
                border: 1px solid #ccc;
                font-family: sans-serif;
              }
            `}
            </style>
        </div>
    );
};

export default FormInput;
