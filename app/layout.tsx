import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import Script from 'next/script';
import { Suspense, type ReactNode } from 'react';
import { SearchBar } from '~/components/search-bar';

const cardo = localFont({
  src: [
    { path: './fonts/Cardo-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Cardo-Italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/Cardo-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cardo',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'
  ),
  title: "Webster's 1913",
  description: "Webster's Unabridged Dictionary, 1913 edition",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cardo.variable}>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-serif antialiased">
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
