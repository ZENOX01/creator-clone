import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Creator Clone",
  description: "AI Scriptwriter for YouTubers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <CSPostHogProvider>
          <body className={`${inter.className} bg-[#0A0A0A] text-white min-h-screen`}>
            {children}
          </body>
        </CSPostHogProvider>
      </html>
    </ClerkProvider>
  );
}