import { redirect } from 'next/navigation'

/**
 * /minha-conta/pedidos → /conta/pedidos
 * Header e MobileMenu linkam para /minha-conta/pedidos mas a rota real é /conta/pedidos
 */
export default function MinhaPedidosRedirectPage() {
  redirect('/conta/pedidos')
}
