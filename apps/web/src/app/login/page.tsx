import { redirect } from 'next/navigation'

/**
 * Página de redirecionamento: /login → /entrar
 * Mantém o query param `redirect` para o interceptor de auth funcionar corretamente.
 */
export default function LoginRedirectPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const redirectTo = searchParams.redirect
  if (redirectTo) {
    redirect(`/entrar?redirect=${encodeURIComponent(redirectTo)}`)
  }
  redirect('/entrar')
}
