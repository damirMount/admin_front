import {Typography} from "antd";
import React from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import {useAlert} from "../../contexts/AlertContext";
import ApparatTaskForm from "../../components/pages/apparat/ApparatTaskForm";

const {Title, Text} = Typography;

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    return (
        <ProtectedElement allowedPermissions="apparats_managment">
            <Head>
                <title>Задания для терминала | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <ApparatTaskForm/>
        </ProtectedElement>
    );
}
