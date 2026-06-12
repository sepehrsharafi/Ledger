import "./globals.css";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ledger",
  display: "swap",
});

export const metadata = {
  title: "Ledger",
  description: "Every client, on the record.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
