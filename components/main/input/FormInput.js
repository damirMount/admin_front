import React, {useRef} from 'react';
import {Input, Typography} from "antd";

const FormInput = ({
                       type,
                       label,
                       id,
                       name,
                       placeholder,
                       defaultValue,
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
        defaultValue: defaultValue,
        value: value,
        onChange: onChange,
        accept: accept,
        required: required,
        className: className,
        style: style,
        prefix: prefix,
        ref: inputRef,
        size: "large",
    };
    const {Text} = Typography;

    return (
        <div className="d-flex flex-column form-group w-100">
            <Text type="secondary" className="mb-1">
                {label}
            </Text>
            <Input {...sharedProps} />
        </div>
    );
};
export default FormInput
