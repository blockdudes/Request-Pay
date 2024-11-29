import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import RootProvider from "@/lib/providers/RootProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Request Pay",
  description: "Simplify Your Transactions with Ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          <Toaster />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}