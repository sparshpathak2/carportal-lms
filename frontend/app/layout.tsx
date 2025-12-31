import type { Metadata } from "next";
import { Lato, Manrope, Rubik } from "next/font/google";
import { Figtree } from "next/font/google";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";
import Providers from "@/components/Providers";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// const rubik = Rubik({
//   subsets: ["latin"],
//   variable: "--font-rubik",
//   weight: ["400", "500", "600", "700"],
// });

// const figtree = Figtree({
//   subsets: ["latin"],
//   variable: "--font-figtree",
//   weight: ["400", "500", "600", "700"],
// });

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   weight: ["400", "500", "600", "700"],
// });

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400", "700", "900"],
});

// const manrope = Manrope({
//   subsets: ["latin"],
//   variable: "--font-manrope",
//   weight: ["400", "500", "600", "700"],
// });

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });


// const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: "Carportal LMS",
  description: "Lead Management System by Carportal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}

      {/* <body className={`${rubik.variable} font-sans antialiased min-h-screen flex flex-col`}> */}
      {/* <body className={`${figtree.variable} font-sans antialiased min-h-screen flex flex-col`}> */}
      {/* <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}> */}
      <body className={`${lato.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* <body className={`${manrope.variable} font-sans antialiased min-h-screen flex flex-col`}> */}
        {/* <SessionProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              },
            }}
          />
          {children}
        </SessionProvider> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
