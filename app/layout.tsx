import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import Script from 'next/script';
import { Suspense, type ReactNode } from 'react';
import { SearchBar } from '~/components/search-bar';

const webster = localFont({
  src: [
    { path: './fonts/OldStandard-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/OldStandard-Italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/Besley-ExtraBold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/OldStandard-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-webster',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

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
    <html lang="en" className={`${webster.variable} ${cardo.variable}`}>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="flex h-dvh flex-col overflow-hidden font-serif antialiased">
        <header className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-8 pb-8">
          <Link href="/" className="mb-4 block text-center text-4xl font-bold">
            Webster&rsquo;s 1913
          </Link>
          <Suspense>
            <SearchBar />
          </Suspense>
          <nav className="mt-2 text-right text-sm">
            <Link href="/authors" className="text-muted-foreground hover:text-foreground">
              Authors
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl grow overflow-y-auto px-4 pb-8 has-data-wide:max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
