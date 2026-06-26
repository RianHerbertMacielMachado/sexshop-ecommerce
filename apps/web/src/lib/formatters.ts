export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.toUpperCase()
}

export function formatStockStatus(stock: number): {
  label: string
  color: string
  bgColor: string
} {
  if (stock === 0) return { label: 'Esgotado', color: 'text-red-700', bgColor: 'bg-red-100' }
  if (stock <= 5)
    return { label: `Últimas ${stock} unidades`, color: 'text-orange-700', bgColor: 'bg-orange-100' }
  return { label: 'Em estoque', color: 'text-green-700', bgColor: 'bg-green-100' }
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function maskSensitiveKey(key: string, visibleChars: number = 4): string {
  if (key.length <= visibleChars) return '*'.repeat(key.length)
  return '*'.repeat(key.length - visibleChars) + key.slice(-visibleChars)
}

export function parseApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'Erro desconhecido'
  }
  if (error instanceof Error) return error.message
  return 'Ocorreu um erro inesperado'
}
