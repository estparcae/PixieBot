import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camaral Bot",
  description: "Bot de Telegram con IA para Camaral",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
