"use client"

import { useLang } from "@/hooks/useLang"
import { NavHeader } from "@/components/NavHeader"

export function ArticleHeader() {
  const [lang, setLang] = useLang()
  return <NavHeader lang={lang} setLang={setLang} activePage="blog" />
}
