import "./globals.css";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Carries every uppercase label and every figure that has to line up in a column.
const monoLabel = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-label",
  display: "swap",
});

export const metadata = {
  title: "Ledger",
  description: "Every client, on the record.",
};

export default function RootLayout({ children }) {
  return (
    // The font variables go on <html> so the :root aliases in globals.css can
    // resolve them.
    <html lang="en" className={`${display.variable} ${monoLabel.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
