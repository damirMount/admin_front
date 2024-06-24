import React, {useEffect, useState} from 'react';
import {GET_SERVICES_BY_SERVER_API} from "../../../routes/api";
import {useSession} from "next-auth/react";
import UniversalSelect from "./UniversalSelect";

const ServiceByServerSelect = ({selectedServer, selectedService, onChange}) => {
    const {data: session} = useSession(); // Получаем сессию
    const [servicesList, setServicesList] = useState([]);

    const getServicesByServer = async () => {
        try {
            const params = new URLSearchParams({
                id: selectedServer
            })
            const response = await fetch(`${GET_SERVICES_BY_SERVER_API}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            const servicesList = await response.json();
            const services = servicesList.map((item) => ({
                value: item.id,
                label: `${item.name} ${item.id}`,
            }));

            setServicesList(services)

        } catch (error) {
            console.log('fetch error', error, servicesList, selectedService, servicesList)
        }

    }
    useEffect(() => {
        getServicesByServer()
    }, [selectedServer]);

    return (
        <UniversalSelect
            key={JSON.stringify(servicesList)}
            name='services_id'
            label="Услуги"
            placeholder="Выберете услугу"
            selectedOptions={selectedService.map(serviceItem => serviceItem)}
            options={servicesList}
            onSelectChange={onChange}
            required
            isMulti
        />
    );
};

export default ServiceByServerSelect;
