import index from './generated/index.json'

export interface DocHero { badge?: string; h1?: [string, string]; lead?: string; meta?: string }
export interface DocEntry {
  meta: { title: string; description: string; image: string }
  hero: DocHero
  article: { datePublished?: string | null; dateModified?: string | null; headline?: string | null; image?: string | null }
  faq: { q: string; a: string }[]
}
export interface PostCard { slug: string; tag: string; meta: string; title: string; excerpt: string; image: string; alt: string }

export const docs = index.docs as unknown as Record<string, DocEntry>
export const postCards = index.cards as PostCard[]
export const postSlugs = Object.keys(docs).filter((k) => k.startsWith('blog-'))
