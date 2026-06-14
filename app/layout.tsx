import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Smart-Energy Dashboard",
  description: "Surveillance et optimisation de la consommation énergétique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>{children}</ClientLayout>
  );
}
