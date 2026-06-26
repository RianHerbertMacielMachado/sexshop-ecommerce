'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { SiteSettings } from '@/types'

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings')
      return data.data.settings as SiteSettings
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
