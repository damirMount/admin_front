import fetchData from "../database/DataFetcher";

export async function getUserFio(userId, session) {
    if (!userId || !session) {
        return
    }

    try {
        const config = {model: "User", searchTerm: {id: userId, accurateSearch: true}};
        const result = await fetchData(config, session);

        return result.data[0]?.fio
    } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
    }
}
