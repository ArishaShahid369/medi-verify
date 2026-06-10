'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const path = usePathname()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Scan', path: '/scan' },
    { label: 'Batches', path: '/batches' },
    { label: 'History', path: '/history' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 32px',
      background: 'rgba(10,11,16,0.9)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(0,219,233,0.1)',
    }}>
      {/* Logo */}
      <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,219,233,0.25), rgba(0,219,233,0.05))', border: '1px solid rgba(0,219,233,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔬</div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#00dbe9', letterSpacing: '0.08em' }}>MEDI-VERIFY</span>
      </button>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navLinks.map(link => (
          <button key={link.label} onClick={() => router.push(link.path)} style={{
            background: path === link.path ? 'rgba(0,219,233,0.1)' : 'transparent',
            border: path === link.path ? '1px solid rgba(0,219,233,0.25)' : '1px solid transparent',
            borderRadius: '8px', padding: '8px 16px',
            color: path === link.path ? '#00dbe9' : '#849495',
            fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'all 0.2s',
          }}>{link.label}</button>
        ))}
      </div>

      {/* Right buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 18px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}>
          ⊞ DASHBOARD
        </button>
        <button onClick={() => router.push('/wallet')} style={{ background: '#00dbe9', border: 'none', borderRadius: '10px', padding: '9px 18px', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 16px rgba(0,219,233,0.35)', letterSpacing: '0.06em' }}>
          ⬡ CONNECT WALLET
        </button>
      </div>
    </nav>
  )
}