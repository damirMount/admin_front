// Функция для генерации уникальных ключей
import moment from "moment-timezone";

const getLifetime = (createdAt, days_to_life) => {
    const creationMoment = moment(createdAt);
    const expiresAt = creationMoment.clone().add(days_to_life, 'days');
    const now = moment();

    const daysLeft = createdAt ? Math.max(0, expiresAt.diff(now, 'days')) : '';

    return {
        expiresAt: createdAt ? expiresAt.format('YYYY-MM-DD HH:mm:ss') : '',
        dayLeft: daysLeft,
    };
}
export default getLifetime
