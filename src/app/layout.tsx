import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camaral - Avatares de IA para reuniones",
  description:
    "Automatiza tus reuniones de ventas y soporte con avatares inteligentes que hablan, escuchan y responden como humanos. Disponibles 24/7.",
  openGraph: {
    title: "Camaral - Avatares de IA para reuniones",
    description:
      "Automatiza tus reuniones de ventas y soporte con avatares inteligentes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
