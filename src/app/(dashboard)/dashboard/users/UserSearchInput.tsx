'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import styles from '@/components/dashboard/dashboard.module.css'

export default function UserSearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('query', searchTerm)
      } else {
        params.delete('query')
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        placeholder="Search users..." 
        className={styles.input} 
        style={{ width: '250px', padding: '8px 16px', fontSize: '13px' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isPending && (
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>
          ...
        </div>
      )}
    </div>
  )
}
