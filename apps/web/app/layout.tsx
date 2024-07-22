import "./globals.css";
import { TrpcProvider } from "@/components/providers";
import { TooltipProvider } from "@semicolon/ui/tooltip";
import { Provider as JotaiProvider } from "jotai";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";

const font = Poppins({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Semicolon",
  description: "Social media for the next generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <SessionProvider>
          <JotaiProvider>
            <TrpcProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </TrpcProvider>
          </JotaiProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
