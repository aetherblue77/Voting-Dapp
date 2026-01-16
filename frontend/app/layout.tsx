import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "@/components/Providers"
import {Toaster} from "@/components/ui/sonner"

const inter = Inter({
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Voting Dapp 🗳️",
    description: "Web3 Voting Application by Jonathan Evan",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <Providers>{children}
                    <Toaster position="top-right" richColors/>
                </Providers>
            </body>
        </html>
    )
}
