import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Download, LogOut, Search } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { serviceOptions } from '@/lib/enquiry'

interface User { id: number; email: string; name: string; role: 'admin' | 'sales' }
interface Row { id: number; reference: string; created_at: string; name: string; company: string; email: string; service: string; status: string; preview: string }
interface Detail extends Row { phone: string; budget: string; message: string; notes: string; updated_by: string; updated_at: string; source_page: string }
interface List { items: Row[]; total: number; page: number; pageSize: number; counts: Record<string, number> }

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam']
const label = (v: string) => serviceOptions.find((s) => s.value === v)?.label ?? v
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy focus-visible:border-brand'
const badge: Record<string, string> = { new: 'bg-blue-100 text-blue-800', contacted: 'bg-amber-100 text-amber-800', qualified: 'bg-cyan-100 text-cyan-800', won: 'bg-emerald-100 text-emerald-800', lost: 'bg-slate-200 text-slate-700', spam: 'bg-red-100 text-red-800' }

async function api<T>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', ...init.headers } })
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as T & { error?: string } }
}

function Login({ onDone }: { onDone: (u: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const r = await api<{ user: User }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setBusy(false)
    if (r.ok) onDone(r.data.user)
    else setError(r.data.error ?? 'Sign-in failed.')
  }
  return (
    <div className="mx-auto max-w-sm">
      <Card><CardContent className="p-8">
        <h1 className="text-2xl">Team sign-in</h1>
        <p className="mt-1 text-sm text-slate-500">JwithKP enquiry dashboard</p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="text-sm font-semibold text-navy">Email<input type="email" autoComplete="username" required className={`${field} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="text-sm font-semibold text-navy">Password<input type="password" autoComplete="current-password" required className={`${field} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </CardContent></Card>
    </div>
  )
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<List | null>(null)
  const [open, setOpen] = useState<Detail | null>(null)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState('')

  const load = useCallback(async () => {
    const p = new URLSearchParams({ page: String(page) })
    if (status) p.set('status', status)
    if (q.trim()) p.set('q', q.trim())
    const r = await api<List>(`/api/admin/enquiries?${p}`)
    if (r.status === 401) return onLogout()
    if (r.ok) setList(r.data)
  }, [page, status, q, onLogout])
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t) }, [load, q])

  async function show(id: number) {
    const r = await api<{ item: Detail }>(`/api/admin/enquiries/${id}`)
    if (r.ok) { setOpen(r.data.item); setNotes(r.data.item.notes); setSaved('') }
  }
  async function patch(body: { status?: string; notes?: string }) {
    if (!open) return
    const r = await api(`/api/admin/enquiries/${open.id}`, { method: 'PATCH', body: JSON.stringify(body) })
    if (r.ok) { setSaved('Saved'); setOpen({ ...open, ...body, updated_by: user.email, updated_at: new Date().toISOString() }); load() } else setSaved(r.data.error ?? 'Could not save')
  }
  async function logout() { await api('/api/admin/logout', { method: 'POST' }); onLogout() }

  const pages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl">Enquiries</h1><p className="text-sm text-slate-500">Signed in as {user.name || user.email} ({user.role})</p></div>
        <div className="flex gap-2">
          {user.role === 'admin' && <Button asChild variant="secondary" size="sm"><a href="/api/admin/export"><Download className="h-4 w-4" aria-hidden="true" /> Export CSV</a></Button>}
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} type="button" onClick={() => { setStatus(s); setPage(1) }} aria-pressed={status === s} className={`rounded-full border px-3 py-1 text-sm font-medium ${status === s ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {s || 'All'}{s && list?.counts[s] ? ` (${list.counts[s]})` : ''}
          </button>
        ))}
      </div>
      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input className={`${field} pl-9`} placeholder="Search name, company, email, reference or message" aria-label="Search enquiries" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-navy"><tr><th className="p-3" scope="col">Received</th><th className="p-3" scope="col">Name</th><th className="p-3" scope="col">Service</th><th className="p-3" scope="col">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list?.items.map((r) => (
                <tr key={r.id} className={`cursor-pointer hover:bg-slate-50 ${open?.id === r.id ? 'bg-brand/5' : ''}`} onClick={() => show(r.id)}>
                  <td className="p-3 text-slate-600">{when(r.created_at)}</td>
                  <td className="p-3"><button type="button" className="text-left font-semibold text-navy hover:underline" onClick={(e) => { e.stopPropagation(); show(r.id) }}>{r.name}</button><div className="text-xs text-slate-500">{r.company || r.email}</div></td>
                  <td className="p-3">{label(r.service)}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[r.status] ?? ''}`}>{r.status}</span></td>
                </tr>
              ))}
              {list && !list.items.length && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No enquiries found.</td></tr>}
            </tbody>
          </table>
          {list && list.total > list.pageSize && (
            <div className="flex items-center justify-between border-t border-slate-100 p-3 text-sm">
              <span className="text-slate-500">{list.total} enquiries</span>
              <span className="flex items-center gap-2"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>Page {page} of {pages}<Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></span>
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardContent>
            {!open ? <p className="text-sm text-slate-500">Select an enquiry to see the details.</p> : (
              <div className="grid gap-3 text-sm">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-brand">{open.reference}</p><h2 className="text-xl">{open.name}</h2><p className="text-slate-500">{when(open.created_at)}</p></div>
                <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1">
                  <dt className="text-slate-500">Email</dt><dd><a className="text-brand hover:underline" href={`mailto:${open.email}`}>{open.email}</a></dd>
                  <dt className="text-slate-500">Phone</dt><dd>{open.phone ? <a className="text-brand hover:underline" href={`tel:${open.phone}`}>{open.phone}</a> : '-'}</dd>
                  <dt className="text-slate-500">Company</dt><dd>{open.company || '-'}</dd>
                  <dt className="text-slate-500">Service</dt><dd>{label(open.service)}</dd>
                  <dt className="text-slate-500">Budget</dt><dd>{open.budget || '-'}</dd>
                  <dt className="text-slate-500">Page</dt><dd>{open.source_page || '-'}</dd>
                </dl>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700">{open.message}</p>
                <label className="font-semibold text-navy">Status
                  <select className={`${field} mt-1`} value={open.status} onChange={(e) => patch({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                <label className="font-semibold text-navy">Internal notes
                  <textarea rows={4} className={`${field} mt-1`} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </label>
                <div className="flex items-center gap-3"><Button size="sm" onClick={() => patch({ notes })}>Save notes</Button><span role="status" className="text-slate-500">{saved}</span></div>
                {open.updated_by && <p className="text-xs text-slate-400">Last updated by {open.updated_by}, {when(open.updated_at)}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Admin() {
  const [state, setState] = useState<'loading' | 'out' | User>('loading')
  useEffect(() => { api<{ user: User }>('/api/admin/me').then((r) => setState(r.ok ? r.data.user : 'out')) }, [])
  return (
    <Layout>
      <section className="section">
        <div className="container">
          {state === 'loading' ? <p className="text-slate-500" aria-busy="true">Loading…</p> : state === 'out' ? <Login onDone={setState} /> : <Dashboard user={state} onLogout={() => setState('out')} />}
        </div>
      </section>
    </Layout>
  )
}
