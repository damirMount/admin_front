import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import {POST_LOGIN_API} from "../../../routes/api";

export default NextAuth({

    providers: [
        CredentialsProvider({
            credentials: {
                username: {label: "Username", type: "text"},
                password: {label: "Password", type: "password"}
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
                        return {
                            user: response.user,
                            accessToken: response.accessToken,
                            tokenExpires: response.tokenExpires
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
    callbacks: {
        async jwt({token, user, account, profile, isNewUser}) {
            if (user) {
                token = user;
                token.accessToken = user.accessToken;
                token.tokenExpires = user.tokenExpires
            }
            return token;
        },

        async session({session, token}) {
            if (token.user) {
                session.user = {
                    id: token.user.id,
                    name: token.user.fio,
                    role: token.user.role_name,
                    // permissions: token.user.permissions,
                    // id_role: token.user.id_role,
                };
                session.accessToken = token.accessToken;
                session.expires = token.tokenExpires
            }
            return session;
        },
    },
});
