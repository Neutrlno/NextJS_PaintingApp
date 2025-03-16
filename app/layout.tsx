import Head from './head'
import './globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" style={{ fontFamily: "Roboto, Arial, sans-serif" }}>
            <Head />
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />
            </head>

            <body>{children}</body>
        </html>
    )
}
