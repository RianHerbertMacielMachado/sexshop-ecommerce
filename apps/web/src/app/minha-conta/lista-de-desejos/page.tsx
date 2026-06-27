import { redirect } from 'next/navigation'

/**
 * Página de redirecionamento: /minha-conta/lista-de-desejos → /conta/lista-desejos
 */
export default function WishlistRedirectPage() {
  redirect('/conta/lista-desejos')
}
