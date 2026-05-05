export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/profile/'],
      },
    ],
    sitemap: 'https://adgena.pro/sitemap.xml',
  };
}
