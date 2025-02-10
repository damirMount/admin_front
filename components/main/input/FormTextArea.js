import React, {useRef} from 'react';
import {Input, Typography} from "antd";

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
    const {Text} = Typography;

    return (
        <div className="d-flex flex-column form-group">
            <Text type="secondary" className="mb-1">
                {label}
            </Text>
            <Input.TextArea {...sharedProps} />
        </div>
    );
};
export default FormTextArea
