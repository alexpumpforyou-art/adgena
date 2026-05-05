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
