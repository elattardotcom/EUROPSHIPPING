import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.codshipeurope.com"
  const now  = new Date()

  return [
    { url: base,                           lastModified: now, changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/conditions`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/confidentialite`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/rgpd`,                 lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/mentions-legales`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]
}
