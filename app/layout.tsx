import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StrandCraft - Create Your Own Word Puzzles",
  description: "A DIY Strands Puzzle Creator — Create and share custom word puzzles inspired by NYT Strands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
