import { redirect } from 'next/navigation'

/**
 * /minha-conta → /conta
 * Header e MobileMenu linkam para /minha-conta mas a rota real é /conta
 */
export default function MinhaContaRedirectPage() {
  redirect('/conta')
}
