/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/contexts/auth/Provider";
import { PropsWithChildren } from "react";
import { AuthLayout } from "@/components/ui/layouts/AuthLayout";
import { OnboardingTourProvider } from "@/contexts/onboarding-tour/Provider";
import { OnbordaProvider } from "onborda";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const imbPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPIN Legal",
  description: "Sistema de Cálculos Jurídicos para Apenados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${imbPlexSans.variable} antialiased overflow-x-hidden`} suppressHydrationWarning>
        <ActualLayout>{children}</ActualLayout>
        <Toaster />
      </body>
    </html>
  );
}

export const ActualLayout = ({ children }: PropsWithChildren) => (
  <OnbordaProvider>
    <TooltipProvider>
      <NextIntlClientProvider>
        <AuthProvider>
          <AuthLayout>
            <OnboardingTourProvider>{children}</OnboardingTourProvider>
          </AuthLayout>
        </AuthProvider>
      </NextIntlClientProvider>
    </TooltipProvider>
  </OnbordaProvider>
);
