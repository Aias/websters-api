import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { SearchBar } from '~/components/search-bar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Webster's 1913 Unabridged Dictionary",
  description: "Webster's Unabridged Dictionary, 1913 edition",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <header className="mx-auto max-w-2xl px-4 pt-8 pb-6">
          <Link href="/" className="mb-4 block text-4xl font-bold">
            Webster&rsquo;s 1913
          </Link>
          <Suspense>
            <SearchBar />
          </Suspense>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-8">{children}</main>
      </body>
    </html>
  );
}
