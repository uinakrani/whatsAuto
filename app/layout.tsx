'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { NotificationProvider } from "@/lib/notifications";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>WhatsAuto - WhatsApp Invitation Automation</title>
        <meta name="description" content="Automate WhatsApp invitation sending with PDF attachments" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          {children}
          <Navigation />
        </NotificationProvider>
      </body>
    </html>
  );
}

