import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Compass Cafe",
  description: "A cozy three-action onchain cafe compass mini app for Base."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6a27e3d9cf15720bcb102d49" />
        <meta
          name="talentapp:project_verification"
          content="8de198e65d12f6b8a445fdebcfb7a46297de5ca1a8d8aa1cd61d0b09fdd02f750e580d6a9cbc7fcf1d7aa365c1aa92b7fdf4e1b410679c310b7e0d74f88ed0d1"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
