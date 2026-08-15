import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import AppProviders from "@/components/AppProviders";
import AuthWrapper from "@/components/AuthWrapper";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/hooks/useTheme";

import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Bibliotech — Ascitech",
    description:
        "La bibliothèque scolaire numérique d'Ascitech : consultez et téléchargez les manuels de votre classe, même hors connexion.",
    applicationName: "Bibliotech",
    icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
        { media: "(prefers-color-scheme: dark)", color: "#0c0f12" },
    ],
    width: "device-width",
    initialScale: 1,
    // Le lecteur affiche des images de page : le zoom doit rester possible.
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                {/* Applique le theme enregistre avant le premier rendu. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <AppProviders>
                    <AuthWrapper>{children}</AuthWrapper>
                </AppProviders>
            </body>
        </html>
    );
}
