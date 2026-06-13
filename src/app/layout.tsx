import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { GlobalToaster } from "~/components/GlobalToaster";

export const metadata: Metadata = {
  title: "DB Manager | Elite Portal",
  description: "Database control system for Sri Lankan Airlines",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

import { ThemeProvider } from "~/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30 transition-colors">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <GlobalToaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
