import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mitthan Di Hatti - Sweets & Restaurant Since 1890",
  description: "Mitthan Di Hatti - Premium Indian Sweets & Restaurant in Panipat",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-cream">
        <ErrorBoundary>
          <CartProvider>
            {children}
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
