import type { Metadata } from 'next';
import Link from 'next/link';

import './globals.css';

export const metadata: Metadata = {
  title: 'Forms',
  description: 'Internal questionnaires',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/">Forms</Link>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Next.js + Nest (in-memory)
          </span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
