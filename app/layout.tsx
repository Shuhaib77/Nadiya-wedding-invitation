import type { Metadata } from "next";
import { Playfair_Display, Jost, Great_Vibes, Amiri } from "next/font/google";
import { invitation as c } from "@/invitation.config";
import "./globals.css";

const pf = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-pf" });
const jost = Jost({ subsets: ["latin"], variable: "--f-jost" });
const gv = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--f-gv" });
const ar = Amiri({ subsets: ["arabic"], weight: "400", variable: "--f-ar" });

export const metadata: Metadata = {
  title: `${c.bride} & ${c.groom} | Wedding Invitation`,
  description: `You are invited to the wedding of ${c.bride} and ${c.groom}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pf.variable} ${jost.variable} ${gv.variable} ${ar.variable}`}>
      <body>{children}</body>
    </html>
  );
}
