import {format} from 'date-fns';
import dayjs from 'dayjs';
import {DatePicker, Typography} from 'antd';
import {useEffect} from 'react';

const {Text} = Typography;
const {RangePicker} = DatePicker;

const DateRangePicker = ({startDate, endDate, onDateChange, size = 'large', allowClear = true}) => {
    const dateFormat = 'yyyy-MM-dd';
    // Форматируем сегодняшнюю дату
    const todayFormatted = format(new Date(), dateFormat);

    // Если startDate и endDate заданы, используем их, иначе – сегодняшнюю дату
    const defaultStart = startDate ? dayjs(startDate) : dayjs(todayFormatted);
    const defaultEnd = endDate ? dayjs(endDate) : dayjs(todayFormatted);

    // Вызываем onDateChange только один раз при монтировании
    useEffect(() => {
        onDateChange([defaultStart, defaultEnd]);
    }, []); // пустой массив зависимостей – эффект выполнится один раз

    return (
        <div className="d-flex flex-column">
            <Text type="secondary" className="mb-1">
                Период времени
            </Text>
            <RangePicker
                size={size}
                defaultValue={[defaultStart, defaultEnd]}
                maxDate={dayjs(todayFormatted)}
                allowClear={allowClear}
                onChange={(dateStrings, dates) => {
                    if (!dates || dates.length < 2) return;
                    // Преобразуем выбранные даты в dayjs-объекты
                    const selectedStart = dayjs(dates[0]);
                    const selectedEnd = dayjs(dates[1]);
                    // Если выбранный диапазон совпадает с исходным, ничего не делаем
                    if (
                        selectedStart.isSame(defaultStart, 'day') &&
                        selectedEnd.isSame(defaultEnd, 'day')
                    ) {
                        return;
                    }
                    onDateChange(dates);
                }}
            />
        </div>
    );
};

export default DateRangePicker;
