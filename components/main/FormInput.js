import React from 'react';

const FormInput = ({type, id, name, placeholder, value, onChange, accept, required, className, field_signature,form_signature,visibility_annotation}) => {
    return (
        <div>
            <input
                type={type}
                className={className}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                accept={accept}
                required={required}
            />
        </div>
    );
};

export default FormInput;
