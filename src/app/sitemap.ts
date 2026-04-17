import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cekwajar.id'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/wajar-slip`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/wajar-gaji`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/wajar-tanah`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/wajar-hidup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/wajar-kabur`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/kontak`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
