"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function ThemeAwareClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: resolvedTheme === "dark" ? "#ffffff" : "#1a1a1a",
          colorBackground: resolvedTheme === "dark" ? "#18181b" : "#ffffff", // zinc-900 or white
          colorInputBackground: "transparent",
          borderRadius: "0.75rem", // rounded-xl
        },
        elements: {
          card: "shadow-xl border border-black/5 dark:border-white/10 rounded-2xl bg-white dark:bg-zinc-900",
          formButtonPrimary: "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-black dark:hover:bg-zinc-200 transition-colors font-semibold rounded-xl",
          socialButtonsBlockButton: "bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 text-[#1a1a1a] dark:text-white transition-colors rounded-xl",
          socialButtonsBlockButtonText: "font-semibold text-[#1a1a1a] dark:text-white",
          formFieldInput: "bg-transparent border border-black/10 dark:border-white/10 text-[#1a1a1a] dark:text-white placeholder:text-[#8e8e8e] dark:placeholder:text-zinc-500 focus:border-black/30 dark:focus:border-white/30 rounded-xl",
          footerActionLink: "text-[#1a1a1a] dark:text-white font-semibold hover:text-black dark:hover:text-white/80 transition-colors",
          formFieldLabel: "text-[#1a1a1a] dark:text-white/80 font-medium",
          headerTitle: "text-[#1a1a1a] dark:text-white font-display text-2xl font-semibold",
          headerSubtitle: "text-[#8e8e8e] dark:text-white/60",
          dividerLine: "bg-black/10 dark:bg-white/10",
          dividerText: "text-[#8e8e8e] dark:text-white/60",
          identityPreviewText: "text-[#1a1a1a] dark:text-white",
          identityPreviewEditButtonIcon: "text-[#8e8e8e] dark:text-white/60 hover:text-[#1a1a1a] dark:hover:text-white",
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
