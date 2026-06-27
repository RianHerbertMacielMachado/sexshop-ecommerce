import { redirect } from 'next/navigation'

/**
 * /admin/dashboard → /admin
 * O Next.js prefetcha esta rota que aparece em links externos/cache.
 * O dashboard admin vive em /admin (page.tsx).
 */
export default function AdminDashboardRedirectPage() {
  redirect('/admin')
}
