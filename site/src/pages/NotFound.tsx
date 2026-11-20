import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <Layout>
      <section className="section">
        <div className="container max-w-xl text-center">
          <p className="eyebrow">Error 404</p>
          <h1 className="text-4xl">Page not found</h1>
          <p className="lead mt-4">The page you are looking for does not exist or has moved. Try one of these instead.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild><Link to="/">Home</Link></Button>
            <Button asChild variant="secondary"><Link to="/services">Services</Link></Button>
            <Button asChild variant="secondary"><Link to="/contact">Contact</Link></Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
