import React, {useEffect, useState} from "react";
import {format} from 'date-fns';
import {DatePicker} from "antd";
import dayjs from "dayjs";

const DateRangeInput = ({initialStartDate, initialEndDate, onDateChange}) => {
    const [startDate, setStartDate] = useState(initialStartDate || "");
    const [endDate, setEndDate] = useState(initialEndDate || "");

    const getCurrentDate = () => {
        const today = new Date();
        return format(today, 'yyyy-MM-dd');
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        onDateChange(newStartDate, endDate);
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        onDateChange(startDate, newEndDate);
    };

    useEffect(() => {
        if (!initialStartDate || !initialEndDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().substr(0, 10);
            setStartDate(initialStartDate || yesterdayString);
            setEndDate(initialEndDate || yesterdayString);
            onDateChange(initialStartDate || yesterdayString, initialEndDate || yesterdayString);
        }
    }, [initialStartDate, initialEndDate]);

    // const dateFormat = 'yyyy-MM-dd';
    // const todayFormatted = format(new Date(), dateFormat);
    //
    // return (
    //     <div className="d-flex  justify-content-center w-100  form-group">
    //         <div className="d-flex flex-column w-100">
    //             <label htmlFor="serverId">Период отправки</label>
    //             <DatePicker.RangePicker
    //                 size="large"
    //                 maxDate={dayjs(todayFormatted)}
    //                 onChange={(dates, dateStrings) => {
    //                     console.log(dates, dateStrings);
    //                 }}
    //             />
    //         </div>
    //     </div>
    // );
    return (
        <div className="d-flex w-100 justify-content-between">
            <div className="form-group me-3">
                <label htmlFor="startDate">Дата начала</label>
                <input
                    type="date"
                    className="input-field pe-2"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    max={getCurrentDate()}
                    onChange={handleStartDateChange}
                    required
                />
            </div>
            <div className="form-group ms-3">
                <label htmlFor="endDate">Дата конца</label>
                <input
                    type="date"
                    className="input-field pe-2"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    max={getCurrentDate()}
                    onChange={handleEndDateChange}
                    required
                />
            </div>
        </div>
    );
};

export default DateRangeInput;
