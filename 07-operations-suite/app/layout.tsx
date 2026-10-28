import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Operations Suite — Five Full-Stack Business Systems", template: "%s — Operations Suite" },
  description: "A portfolio suite of five role-based business systems designed and developed by Aljon Mariano.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#101316" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
