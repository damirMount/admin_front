import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { POST_LOGIN_API } from "../../../routes/api";

export default NextAuth({

    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    const res = await fetch(POST_LOGIN_API, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(credentials)
                    });

                    const response = await res.json();

                    if (res.ok) {
                        console.log(response)
                        return {
                            user: response.user,
                            accessToken: response.accessToken
                        };
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    console.error('Error logging in:', error);
                    throw error;
                }
            },
        })

    ],
    session: {
        jwt: true,
        maxAge: 12 * 60 * 60, // 12 часов
    },
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                token = user;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = {
                    id: token.user.id,
                    name: token.user.fio,
                    role: token.user.role_name,
                    id_role: token.user.id_role,
                };
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
    cookies: {
        sessionToken: {
            name: 'authToken', // Название куки
            options: {
                path: '/', // Путь куки (обычно '/')
                httpOnly: false, // Доступ к куки из JavaScript
                maxAge: 12 * 60 * 60, // Время жизни куки в секундах
            }
        }
    }
});
