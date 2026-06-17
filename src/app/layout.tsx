import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: '#1a1a1a',
          colorText: 'white',
          colorPrimary: 'white',
          colorTextOnPrimaryBackground: '#1a1a1a',
          colorInputBackground: 'transparent',
          colorInputText: 'white',
          borderRadius: '1rem',
        },
        elements: {
          card: "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl",
          formButtonPrimary: "bg-white text-[#1a1a1a] hover:bg-white/90 font-medium rounded-full transition-colors",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-colors",
          socialButtonsBlockButtonText: "font-semibold",
          formFieldInput: "bg-white/5 border border-white/10 text-white placeholder:text-white/50 rounded-xl focus:border-white/30 focus:ring-white/30",
          footerActionLink: "text-white font-semibold hover:text-white/80 transition-colors",
          formFieldLabel: "text-white/80 font-medium",
          headerTitle: "text-white font-display text-2xl font-semibold",
          headerSubtitle: "text-white/60",
          dividerLine: "bg-white/10",
          dividerText: "text-white/60",
          identityPreviewText: "text-white",
          identityPreviewEditButtonIcon: "text-white/60 hover:text-white",
          formFieldWarningText: "text-white/80",
          formFieldErrorText: "text-red-400",
        }
      }}
    >
      <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
