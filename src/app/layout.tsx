import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeAwareClerkProvider } from "@/components/ThemeAwareClerkProvider";

export const metadata: Metadata = {
  title: "Corsair AI Workspace",
  description: "Prompt Gmail and Google Calendar actions with Corsair",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAwareClerkProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeAwareClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
