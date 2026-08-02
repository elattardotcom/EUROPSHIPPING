import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.codshipeurope.com"
  const now  = new Date()

  return [
    { url: base,                                                                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/connect`,                                                     lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`,                                                     lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Country landing pages — high SEO priority
    { url: `${base}/dropshipping-cod-espagne`,                                    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dropshipping-cod-portugal`,                                   lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dropshipping-cod-italie`,                                     lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Blog
    { url: `${base}/blog`,                                                        lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/blog/guide-dropshipping-cod-europe-2025`,                     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog/avantages-cod-vs-prepaye-dropshipping`,                  lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Legal
    { url: `${base}/conditions`,                                                  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/confidentialite`,                                             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/rgpd`,                                                        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/mentions-legales`,                                            lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]
}
