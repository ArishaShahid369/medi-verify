'use client'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '28px 32px 100px',
      background: 'rgba(10,11,16,0.8)',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,219,233,0.1)', border: '1px solid rgba(0,219,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🔬</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#00dbe9', letterSpacing: '0.08em' }}>MEDI-VERIFY</span>
        </div>
        <p style={{ fontSize: '12px', color: '#5a6370', textAlign: 'center' }}>
          © 2026 MediVerify. Blockchain-powered pharmaceutical authentication. 🌍
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Privacy', 'Terms', 'Docs', 'Contact'].map(link => (
            <span key={link} style={{ fontSize: '12px', color: '#5a6370', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{link}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}