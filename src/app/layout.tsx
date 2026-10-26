import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenSource — Global Collaborative Commerce Platform",
  description:
    "Build together. Sell together. Earn together. Connect product owners with independent cross-functional teams to market products and share transparent commissions from verified commercial results.",
  keywords: [
    "Collaborative Commerce",
    "Commission Sharing",
    "Product Growth",
    "B2B Sales Teams",
    "Affiliate Attribution",
    "Revenue Sharing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
