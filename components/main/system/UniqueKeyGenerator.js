// Функция для генерации уникальных ключей
const uniqueKeyGenerator = () => {
    return Math.random().toString(36).substr(2, 9);
};

export default uniqueKeyGenerator
