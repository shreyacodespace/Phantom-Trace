import "./globals.css";
import { Rubik_Glitch, Yatra_One, Space_Grotesk, Inter, JetBrains_Mono, Unbounded } from "next/font/google";
const title = Unbounded({ subsets: ["latin"], variable: "--f-title" });
const glitch = Rubik_Glitch({ weight: "400", subsets: ["latin"], variable: "--f-glitch" });
const desi = Yatra_One({ weight: "400", subsets: ["devanagari", "latin"], variable: "--f-desi" });
const head = Space_Grotesk({ subsets: ["latin"], variable: "--f-head" });
const body = Inter({ subsets: ["latin"], variable: "--f-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono" });
export const metadata = { title: "PHANTOM TRACE", description: "Digital exposure, identity trust, data movement and behavioural threat intelligence." };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${title.variable} ${glitch.variable} ${desi.variable} ${head.variable} ${body.variable} ${mono.variable}`}>{children}</body></html>;
}
