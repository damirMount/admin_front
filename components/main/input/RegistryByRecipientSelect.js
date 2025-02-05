import React, {useEffect, useState} from 'react';
import {GET_REGISTRY_BY_RECIPIENT_API} from "../../../routes/api";
import {useSession} from "next-auth/react";
import UniversalSelect from "./UniversalSelect";

const RegistryByRecipientSelect = ({selectedRecipient, selectedRegistry, onChange}) => {
    const {data: session} = useSession(); // Получаем сессию
    const [registriesList, setRegistriesList] = useState([]);
    const getRegistriesByRecipient = async () => {
        try {
            const params = new URLSearchParams({
                id: selectedRecipient
            });
            const response = await fetch(`${GET_REGISTRY_BY_RECIPIENT_API}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            const registriesList = await response.json();
            const registries = registriesList.map((item) => ({
                value: item,
                label: `${item.name} ${item.id}`,
            }));

            setRegistriesList(registries);

        } catch (error) {
            console.error('fetch error', error);
        }

    };

    useEffect(() => {
        getRegistriesByRecipient();
    }, [selectedRecipient]);

    return (
        <UniversalSelect
            key={JSON.stringify(registriesList)}
            name='registry_id'
            label="Реестр"
            firstOptionSelected={true}
            placeholder="Выберете реестр"
            options={registriesList}
            onSelectChange={onChange}
            required
        />
    );
};

export default RegistryByRecipientSelect;
