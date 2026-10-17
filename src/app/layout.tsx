import type { Metadata } from "next";
import "@/styles/index.css";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "Bharat-Bazar — India's #1 Online Marketplace",
  description:
    "Shop sarees, electronics, jewellery, kitchen, ayurveda and more with free delivery, COD, and fastest shipping across India.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
