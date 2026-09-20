import type { Metadata } from "next";
import { Anton, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vintage Club Studio — Maglie, Completi & Pantaloni",
  description:
    "Vintage Club Studio: la selezione 3D di maglie, completi e pantaloni vintage.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${anton.variable} ${playfair.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}