import React, {useRef} from 'react';
import {Input} from "antd";

const FormTextArea = ({
                          type,
                          label,
                          id,
                          name,
                          placeholder,
                          value,
                          onChange,
                          accept,
                          required,
                          className,
                          style,
                          prefix
                      }) => {
    const inputRef = useRef(null);
    const sharedProps = {
        id: id,
        type: type,
        name: name,
        placeholder: placeholder,
        defaultValue: value,
        onChange: onChange,
        accept: accept,
        required: required,
        className: className,
        style: style,
        prefix: prefix,
        ref: inputRef,
        size: "large",

    };

    return (
        <div className="d-flex flex-column form-group">
            <label>{label}</label>
            <Input.TextArea {...sharedProps} />
        </div>
    )
        ;
};
export default FormTextArea
