
import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import Refresh_token_component from './Components/SelfComponent/refresh_token/refresh_token_component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Providers from "@/app/Components/SelfComponent/Provider/Provider";
// Configure the font
const poppins = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
});

export const metadata: Metadata = {
    title: 'Modula AI',
    description: 'Multi LLM Chatbot with personality',
};


const queryClient = new QueryClient();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${poppins.variable} bg-black`}>
            <body className={poppins.className}>
            <Providers>
                {children}
            </Providers>
            </body>
        </html>
    );
}
