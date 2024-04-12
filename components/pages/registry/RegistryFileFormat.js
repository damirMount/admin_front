import React, { useEffect, useState } from "react";

const RegistryFileFormat = ({ formData = [], setFormData, isRadioMode = false }) => {
    const [selectedFormats, setSelectedFormats] = useState([]);

    const handleFormatChange = (event) => {
        const { name, checked } = event.target;

        if (isRadioMode) {
            setSelectedFormats([name]);
            setFormData((prevFormData) => ({
                ...prevFormData,
                formats: [name], // If radio mode, set only the selected format
            }));
        } else {
            setFormData((prevFormData) => {
                let formats;
                if (checked) {
                    formats = [...selectedFormats, name]; // Add the format if checked
                } else {
                    formats = selectedFormats.filter(format => format !== name); // Remove the format if unchecked
                }
                setSelectedFormats(formats); // Update selected formats
                return {
                    ...prevFormData,
                    formats,
                };
            });
        }
    };


    useEffect(() => {
        setSelectedFormats(formData.formats);
    }, [formData]);

    return (
        <div>
            <div className="form-group d-flex align-items-center flex-column mt-4">
                <div className="d-flex justify-content-evenly">
                    {["xlsx", "csv", "dbf"].map(format => (
                        <div key={format}>
                            <input
                                autoComplete="off"
                                id={`btn-${format}`}
                                className={`btn-checked btn-grey`}
                                type={isRadioMode ? "radio" : "checkbox"}
                                name={format}
                                checked={selectedFormats.includes(format)}
                                onChange={handleFormatChange}
                                required={!isRadioMode}
                            />
                            <label
                                className={`btn me-2 ${
                                    selectedFormats.includes(format) ? "btn-purple" : "btn-grey"
                                }`}
                                htmlFor={`btn-${format}`}
                            >
                                {format.toUpperCase()}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RegistryFileFormat;
