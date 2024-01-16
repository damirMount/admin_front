/** @type {import('next').NextConfig} */
const {nextui} = require("@nextui-org/react");
require('dotenv').config();
const nextConfig = {
    content: [
        // ...
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [nextui()]
}

module.exports = {
    // Другие конфигурации...
    plugins: [nextui()],
};
// next.config.js
// module.exports = {
//     async redirects() {
//         return [
//             {
//                 source: '/',
//                 destination: '/login', // Перенаправляем "/" на "/home"
//                 permanent: true,
//             },
//         ];
//     },
// };
