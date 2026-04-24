import './globals.css';

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
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
