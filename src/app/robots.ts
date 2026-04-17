import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/auth/callback'],
    },
    sitemap: 'https://cekwajar.id/sitemap.xml',
  }
}
