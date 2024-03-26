import React, {useEffect, useState} from "react";

const RegistryFileFormat = ({formData = [], setFormData}) => {
    const [selectedCheckboxCount, setSelectedCheckboxCount] = useState(0);

    // Обработчик изменения выбранных чекбоксов
    const handleCheckboxChange = (event) => {
        const {name, checked} = event.target;
        setFormData((prevFormData) => {
            const formats = [...prevFormData.formats];
            if (checked && !formats.includes(name)) {
                formats.push(name);
            } else if (!checked && formats.includes(name)) {
                formats.splice(formats.indexOf(name), 1);
            }
            return {
                ...prevFormData,
                formats,
            };
        });
    };

    useEffect(() => {
        setSelectedCheckboxCount(formData.formats.length);
    }, [formData]);

    return (<div
            className="form-group d-flex align-items-center flex-column mt-4">
            <div className="d-flex justify-content-evenly w-75">
                <div>
                    <input
                        autoComplete="off"
                        id="btn-xlsx"
                        className="btn-checked btn-grey"
                        type="checkbox"
                        name="xlsx"
                        checked={formData.formats.includes('xlsx')}
                        onChange={handleCheckboxChange}
                        required={selectedCheckboxCount === 0}
                    />
                    <label
                        className={`btn ${
                            formData.formats.includes('xlsx') ? 'btn-purple' : 'btn-grey'
                        }`}
                        htmlFor="btn-xlsx">
                        XLSX
                    </label>
                </div>
                <div>
                    <input
                        autoComplete="off"
                        id="btn-csv"
                        className="btn-checked btn-grey"
                        type="checkbox"
                        name="csv"
                        checked={formData.formats.includes('csv')}
                        onChange={handleCheckboxChange}
                        required={selectedCheckboxCount === 0}
                    />
                    <label
                        className={`btn ${
                            formData.formats.includes('csv') ? 'btn-purple' : 'btn-grey'
                        }`}
                        htmlFor="btn-csv">
                        CSV
                    </label>
                </div>
                <div>
                    <input
                        autoComplete="off"
                        id="btn-dbf"
                        className="btn-checked btn-grey"
                        type="checkbox"
                        name="dbf"
                        checked={formData.formats.includes('dbf')}
                        onChange={handleCheckboxChange}
                        required={selectedCheckboxCount === 0}
                    />
                    <label
                        className={`btn ${
                            formData.formats.includes('dbf') ? 'btn-purple' : 'btn-grey'
                        }`}
                        htmlFor="btn-dbf">
                        DBF
                    </label>
                </div>
            </div>
        </div>
    );
};

export default RegistryFileFormat;
