import { Suspense, type ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Floaters } from './Floaters'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>{children}</Suspense>
      </main>
      <Footer />
      <Floaters />
    </>
  )
}
