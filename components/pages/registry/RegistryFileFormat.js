import React, { useEffect, useState } from "react";

const RegistryFileFormat = ({ formData = [], setFormData, isRadioMode = false, className }) => {
    const [selectedFormats, setSelectedFormats] = useState([]);

    const handleFormatChange = (event) => {
        const { name, checked } = event.target;

        let updatedFormats;

        if (isRadioMode) {
            updatedFormats = [name];
        } else {
            updatedFormats = checked
                ? [...selectedFormats, name]
                : selectedFormats.filter(format => format !== name);
        }

        setSelectedFormats(updatedFormats);

        // Only update the formats field in formData
        setFormData(prevFormData => ({
            ...prevFormData,
            formats: updatedFormats,
        }));
    };

    useEffect(() => {
        setSelectedFormats(formData.formats);
    }, [formData]);

    return (
        <div className={`${className} form-group d-flex align-items-center flex-column`}>
            <div className="d-flex justify-content-evenly">
                {["xlsx", "csv", "dbf"].map(format => (
                    <div key={format}>
                        <input
                            autoComplete="off"
                            id={`btn-${format}`}
                            className={`btn-checked btn-grey`}
                            type={isRadioMode ? "radio" : "checkbox"}
                            name={format}
                            checked={selectedFormats && selectedFormats.includes(format)}
                            onChange={handleFormatChange}
                            required={selectedFormats && !isRadioMode && selectedFormats.length === 0}
                        />
                        <label
                            className={`btn ms-2 ${
                                selectedFormats && selectedFormats.includes(format) ? "btn-purple" : "btn-grey"
                            }`}
                            htmlFor={`btn-${format}`}
                        >
                            {format.toUpperCase()}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegistryFileFormat;
