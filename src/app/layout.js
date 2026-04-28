import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body-next',
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '900'],
  variable: '--font-display-next',
  display: 'swap',
});

export const metadata = {
  title: 'AdGena — AI-генератор карточек товара и рекламных креативов',
  description: 'Создавайте продающие карточки для маркетплейсов и рекламные креативы за секунды с помощью AI. Wildberries, Ozon, Facebook Ads, VK Ads.',
  keywords: 'карточки товара, маркетплейс, wildberries, ozon, генератор креативов, AI дизайн, рекламные креативы',
  openGraph: {
    title: 'AdGena — AI-генератор карточек и креативов',
    description: 'Создавайте продающие карточки для маркетплейсов и рекламные креативы за секунды.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <head>
        <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/logo-icon.webp" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
