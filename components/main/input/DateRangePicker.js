import {format} from 'date-fns';
import dayjs from "dayjs";
import {DatePicker} from "antd";
import {useEffect} from "react";

const DateRangePicker = ({startDate, endDate, onDateChange}) => {
    const dateFormat = 'yyyy-MM-dd';
    const todayFormatted = format(new Date(), dateFormat);
    const RangePicker = DatePicker.RangePicker;

    useEffect(() => {
        onDateChange([todayFormatted, todayFormatted])
    }, []);

    return (
        <div className="d-flex flex-column">
            <label>Период отправки</label>
            <RangePicker
                size="large"
                defaultValue={[
                    dayjs(todayFormatted),
                    dayjs(todayFormatted),

                ]}
                maxDate={dayjs(todayFormatted)}
                onChange={(dateStrings, dates,) => {
                    onDateChange(dates);
                }}
            />
        </div>
    );
};

export default DateRangePicker;
