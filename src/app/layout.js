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
  metadataBase: new URL('https://adgena.pro'),
  title: 'AI-генератор карточек товара для Wildberries и Ozon — AdGena',
  description: 'Создавайте продающие карточки товара, инфографику и рекламные креативы для Wildberries, Ozon и соцсетей за секунды. Загрузите фото товара — получите готовый дизайн.',
  keywords: 'карточки товара, маркетплейс, Wildberries, Ozon, генератор карточек товара, AI карточки товара, инфографика для маркетплейсов, генератор креативов, нейросеть для карточек товара',
  alternates: {
    canonical: '/',
    languages: {
      ru: '/',
      en: '/en',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'AdGena — AI-генератор карточек товара для Wildberries и Ozon',
    description: 'Создавайте продающие карточки товара, инфографику и рекламные креативы за секунды.',
    url: 'https://adgena.pro',
    siteName: 'AdGena',
    images: [
      {
        url: '/adgena.png',
        width: 1200,
        height: 630,
        alt: 'AdGena — AI-генератор карточек товара',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdGena — AI-генератор карточек товара',
    description: 'Карточки товара, инфографика и рекламные креативы для маркетплейсов за секунды.',
    images: ['/adgena.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://adgena.pro/#organization',
      name: 'AdGena',
      url: 'https://adgena.pro',
      logo: 'https://adgena.pro/favicon-512.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://adgena.pro/#website',
      url: 'https://adgena.pro',
      name: 'AdGena',
      publisher: { '@id': 'https://adgena.pro/#organization' },
      inLanguage: 'ru-RU',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://adgena.pro/#software',
      name: 'AdGena',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      url: 'https://adgena.pro',
      image: 'https://adgena.pro/adgena.png',
      description: 'AI-сервис для генерации карточек товара, инфографики и рекламных креативов для маркетплейсов.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RUB',
        lowPrice: '390',
        highPrice: '4990',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-180.png" type="image/png" sizes="180x180" />
        <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/favicon-180.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
          ym(109048904,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
        `}} />
        <noscript dangerouslySetInnerHTML={{ __html: `<div><img src="https://mc.yandex.ru/watch/109048904" style="position:absolute;left:-9999px;" alt="" /></div>` }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
