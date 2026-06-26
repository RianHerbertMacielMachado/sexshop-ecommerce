'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

export function useAuth(requireAuth?: boolean, requireAdmin?: boolean) {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser()
    }
  }, [isAuthenticated, user, refreshUser])

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login?redirect=' + window.location.pathname)
      }
      if (requireAdmin && user?.role !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, router])

  return { user, isAuthenticated, isLoading }
}
