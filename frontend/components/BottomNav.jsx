'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const path = usePathname()

  const items = [
    { icon: '⌂', label: 'HOME', path: '/' },
    { icon: '⊡', label: 'SCAN', path: '/scan' },
    { icon: '◫', label: 'HISTORY', path: '/history' },
    { icon: '⊞', label: 'BATCHES', path: '/batches' },
    { icon: '◈', label: 'WALLET', path: '/wallet' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 0 18px',
      background: 'rgba(10,11,16,0.97)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {items.map(item => {
        const active = path === item.path
        return (
          <button key={item.label} onClick={() => router.push(item.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            background: active ? 'rgba(0,219,233,0.12)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: '14px',
          }}>
            <span style={{ fontSize: '18px', filter: active ? 'drop-shadow(0 0 6px rgba(0,219,233,0.9))' : 'none' }}>{item.icon}</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.09em', color: active ? '#00dbe9' : '#5a6370' }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}