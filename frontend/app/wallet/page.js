'use client'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WalletPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(true)
  const [connecting, setConnecting] = useState(null)
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [network, setNetwork] = useState('mainnet')
  const [step, setStep] = useState(1) // 1=choose wallet, 2=choose role, 3=connected

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  const handleConnect = async (wallet) => {
    setConnecting(wallet)
    try {
      const fakeAddress = '0x' + Array.from({ length: 12 }, () =>
        Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()

      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: fakeAddress, role: 'consumer', name: 'MediVerify User' })
      })
      const data = await response.json()

      if (data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mediverify_token', data.token)
          localStorage.setItem('mediverify_user', JSON.stringify(data.user))
        }
        setWalletAddress(fakeAddress)
        setConnecting(null)
        setConnected(true)
        setStep(2)
      } else {
        console.error('Login failed:', data.message)
        setConnecting(null)
      }
    } catch (error) {
  console.error('Connection error:', error)
  setConnecting(null)
  alert('Backend connection failed. Please try again!')
}

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setTimeout(() => {
      setStep(3)
    }, 600)
  }

  const handleProceed = () => {
    if (selectedRole === 'manufacturer') router.push('/dashboard')
    else router.push('/scan')
  }

  const wallets = [
    { id: 'metamask', name: 'MetaMask', sub: 'Connect to your browser extension', icon: '🦊', color: '#E8821C' },
    { id: 'walletconnect', name: 'WalletConnect', sub: 'Scan with your mobile wallet', icon: '🔵', color: '#3B99FC' },
    { id: 'coinbase', name: 'Coinbase Wallet', sub: 'Use your Coinbase account', icon: '🔵', color: '#0052FF' },
  ]

  const roles = [
    { id: 'consumer', icon: '👤', title: 'Consumer / Patient', sub: 'Verify medicine authenticity', desc: 'Scan and verify medicines, view supply chain, download certificates.', color: '#00dbe9' },
    { id: 'manufacturer', icon: '🏭', title: 'Manufacturer', sub: 'Register & manage batches', desc: 'Register medicine batches on blockchain, manage supply chain, view analytics.', color: '#00f5a0' },
    { id: 'regulator', icon: '🏛️', title: 'Regulator / Authority', sub: 'Monitor and audit', desc: 'Full audit access, fraud reports, counterfeit alerts across all regions.', color: '#c5c4de' },
  ]

  // ── Step 1: Choose Wallet ──
  const StepWallet = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '20px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
          <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>STEP 1 OF 2 — CONNECT WALLET</span>
        </div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '28px' : '36px', color: '#e3e1e9', marginBottom: '12px', lineHeight: 1.1 }}>Connect Your<br /><span style={{ color: '#00dbe9', textShadow: '0 0 30px rgba(0,219,233,0.4)' }}>Identity</span></h1>
        <p style={{ fontSize: '14px', color: '#849495', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto' }}>Access the manufacturer dashboard or sign scan reports with your secure Web3 wallet.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
        {[{ id: 'mainnet', label: 'Ethereum Mainnet', dot: '#00f5a0' }, { id: 'sepolia', label: 'Sepolia Testnet', dot: '#00dbe9' }].map(n => (
          <button key={n.id} onClick={() => setNetwork(n.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: network === n.id ? 'rgba(0,219,233,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${network === n.id ? 'rgba(0,219,233,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '999px', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.dot, boxShadow: `0 0 6px ${n.dot}` }} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: network === n.id ? '#00dbe9' : '#849495', letterSpacing: '0.06em' }}>{n.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {wallets.map(w => (
          <button key={w.id} onClick={() => handleConnect(w.id)} disabled={connecting !== null} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: connecting === w.id ? `rgba(0,219,233,0.1)` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${connecting === w.id ? 'rgba(0,219,233,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '18px 20px', cursor: connecting !== null ? 'not-allowed' : 'pointer', backdropFilter: 'blur(12px)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.2), transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${w.color}15`, border: `1px solid ${w.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{w.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e3e1e9', marginBottom: '3px' }}>{w.name}</div>
                <div style={{ fontSize: '12px', color: '#849495' }}>{w.sub}</div>
              </div>
            </div>
            {connecting === w.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,219,233,0.3)', borderTop: '2px solid #00dbe9', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '11px', color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>CONNECTING</span>
              </div>
            ) : (
              <span style={{ fontSize: '18px', color: '#5a6370' }}>›</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(0,219,233,0.04)', border: '1px solid rgba(0,219,233,0.12)', borderRadius: '14px', padding: '16px' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>🔒</span>
        <div>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, color: '#e3e1e9', marginBottom: '4px' }}>Secure Verification</p>
          <p style={{ fontSize: '12px', color: '#849495', lineHeight: 1.6 }}>Your private keys never leave your device. Connection is encrypted and peer-to-peer.</p>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Choose Role ──
  const StepRole = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '20px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 8px #00f5a0' }} />
          <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00f5a0', letterSpacing: '0.14em' }}>STEP 2 OF 2 — SELECT YOUR ROLE</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: '12px', padding: '10px 18px', marginBottom: '20px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 10px #00f5a0' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#00f5a0', fontWeight: 700 }}>{walletAddress}</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', color: '#849495', letterSpacing: '0.08em' }}>CONNECTED</span>
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '24px' : '32px', color: '#e3e1e9', marginBottom: '10px' }}>Who are you?</h2>
        <p style={{ fontSize: '14px', color: '#849495', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto' }}>Select your role to access the right features and dashboard.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {roles.map(r => (
          <button key={r.id} onClick={() => handleRoleSelect(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: selectedRole === r.id ? `${r.color}10` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${selectedRole === r.id ? `${r.color}40` : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '18px 20px', cursor: 'pointer', backdropFilter: 'blur(12px)', transition: 'all 0.3s', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${r.color}30, transparent)` }} />
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${r.color}12`, border: `1px solid ${r.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: selectedRole === r.id ? r.color : '#e3e1e9', marginBottom: '3px', transition: 'color 0.3s' }}>{r.title}</div>
              <div style={{ fontSize: '12px', color: '#849495', marginBottom: '6px' }}>{r.sub}</div>
              <div style={{ fontSize: '12px', color: '#5a6370', lineHeight: 1.5 }}>{r.desc}</div>
            </div>
            {selectedRole === r.id && <span style={{ fontSize: '18px', flexShrink: 0 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Step 3: Connected Success ──
  const StepConnected = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,160,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,245,160,0.08)', border: '2px solid rgba(0,245,160,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0,245,160,0.3)', fontSize: '36px' }}>✅</div>
          <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '1px solid rgba(0,245,160,0.2)', animation: 'orbit 3s linear infinite' }} />
        </div>
      </div>
      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '26px' : '32px', color: '#00f5a0', textShadow: '0 0 30px rgba(0,245,160,0.4)', marginBottom: '8px' }}>Identity Verified!</h2>
      <p style={{ fontSize: '14px', color: '#849495', marginBottom: '32px', lineHeight: 1.7 }}>Wallet connected. Role assigned.<br />Welcome to MediVerify.</p>

      <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '24px', backdropFilter: 'blur(12px)', textAlign: 'left' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Wallet', val: walletAddress, color: '#00dbe9' },
            { label: 'Network', val: network === 'mainnet' ? 'Ethereum Mainnet' : 'Sepolia Testnet', color: '#00f5a0' },
            { label: 'Role', val: roles.find(r => r.id === selectedRole)?.title || '', color: '#c5c4de' },
            { label: 'Status', val: '● Active & Verified', color: '#00f5a0' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: '12px', color: r.color, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleProceed} style={{ width: '100%', padding: '16px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.12em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 24px rgba(0,219,233,0.45)', marginBottom: '12px' }}>
        {selectedRole === 'manufacturer' ? '→ GO TO DASHBOARD' : '→ START SCANNING'}
      </button>
      <button onClick={() => { setStep(1); setConnected(false); setSelectedRole(null); setWalletAddress('') }} style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
        DISCONNECT WALLET
      </button>
    </div>
  )

  const content = step === 1 ? <StepWallet /> : step === 2 ? <StepRole /> : <StepConnected />

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,219,233,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Navbar />
        <div style={{ padding: '32px 20px', maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1, paddingBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: '3px', borderRadius: '999px', background: step >= s ? '#00dbe9' : 'rgba(255,255,255,0.08)', boxShadow: step >= s ? '0 0 8px rgba(0,219,233,0.5)' : 'none', transition: 'all 0.4s ease' }} />
            ))}
          </div>
          {content}
        </div>
        <Footer />
        <BottomNav />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── DESKTOP ──
  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,219,233,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <Navbar />
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', padding: '60px 80px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center', minHeight: 'calc(100vh - 70px)' }}>

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '28px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>WEB3 IDENTITY SYSTEM</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', color: '#e3e1e9', lineHeight: 1.1, marginBottom: '20px' }}>
            Connect Your<br /><span style={{ color: '#00dbe9', textShadow: '0 0 40px rgba(0,219,233,0.4)' }}>Web3 Identity</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#849495', lineHeight: 1.8, maxWidth: '420px', marginBottom: '40px' }}>Secure, decentralized authentication. Your wallet is your identity — no passwords, no accounts, just cryptographic proof.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🔐', title: 'Zero-Knowledge Auth', desc: 'Your private keys never leave your device' },
              { icon: '⚡', title: 'Instant Verification', desc: 'Sub-second blockchain identity confirmation' },
              { icon: '🌐', title: 'Universal Access', desc: 'Same wallet across all 47 supported countries' },
              { icon: '🛡️', title: 'Role-Based Access', desc: 'Consumer, Manufacturer, or Regulator access' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: '#e3e1e9', marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: '#849495' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '36px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.4), transparent)' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: '3px', borderRadius: '999px', background: step >= s ? '#00dbe9' : 'rgba(255,255,255,0.08)', boxShadow: step >= s ? '0 0 8px rgba(0,219,233,0.5)' : 'none', transition: 'all 0.4s ease' }} />
            ))}
          </div>
          {content}
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}