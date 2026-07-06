'use client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLanguage } from '../lib/LanguageContext'

// ══ Animated Particle/DNA Canvas Background ══
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,219,233,0.4)'
        ctx.fill()

        particles.forEach((p2, j) => {
          if (i === j) return
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0,219,233,${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.6 }} />
}

// ══ Animated Counter ══
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime
    const step = (t) => {
      if (!startTime) startTime = t
      const progress = Math.min((t - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  
  // Custom language global hook directly linked with drop-down state!
  const { t } = useLanguage()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Setup lists connected with dynamic context translation keys
  const features = [
    { icon: '🔐', title: t('features_section.crypto_title') || 'Cryptographic Proof', desc: t('features_section.crypto_desc') || 'SHA-256 hashing creates a tamper-proof fingerprint for every medicine batch.' },
    { icon: '⛓️', title: t('features_section.blockchain_title') || 'Blockchain Ledger', desc: t('features_section.blockchain_desc') || 'Every verification is recorded on an immutable, transparent ledger.' },
    { icon: '📡', title: t('features_section.offline_title') || 'Offline-First', desc: t('features_section.offline_desc') || 'Verify medicines using RSA digital signatures — even without internet.' },
    { icon: '🤖', title: t('features_section.ai_title') || 'AI Risk Engine', desc: t('features_section.ai_desc') || 'Real-time anomaly detection flags suspicious scanning patterns instantly.' },
    { icon: '⚠️', title: t('features_section.recall_title') || 'Smart Recalls', desc: t('features_section.recall_desc') || 'Privacy-preserving batch recalls protect public safety immediately.' },
    { icon: '🌍', title: t('features_section.global_title') || 'Global Network', desc: t('features_section.global_desc') || 'Built to scale across borders, languages, and regulatory systems.' },
  ]

  const steps = [
    { num: '01', title: t('process_section.step1_title') || 'Register on Blockchain', desc: t('process_section.step1_desc') || 'Manufacturers register each batch — a unique cryptographic hash and QR code are generated automatically.' },
    { num: '02', title: t('process_section.step2_title') || 'Scan Anywhere', desc: t('process_section.step2_desc') || 'Consumers scan the QR code with any phone camera — online or completely offline.' },
    { num: '03', title: t('process_section.step3_title') || 'Instant Verification', desc: t('process_section.step3_desc') || 'Get a verified result in under a second, with full supply chain history and risk analysis.' },
  ]

  const techStack = [
    { 
      icon: '⛓️', 
      title: t('tech_section.blockchain_title') || 'Ethereum Blockchain', 
      tag: t('tech_section.tag_blockchain') || 'BLOCKCHAIN', 
      desc: t('tech_section.blockchain_desc') || 'Smart contracts on Ethereum ensure tamper-proof medicine registration. Every batch hash is permanently immutable.', 
      tags: ['Smart Contracts', 'ERC-721', 'Hardhat', 'Web3.js'] 
    },
    { 
      icon: '🔑', 
      title: t('tech_section.crypto_title') || 'SHA-256 Cryptography', 
      tag: t('tech_section.tag_security') || 'SECURITY', 
      desc: t('tech_section.crypto_desc') || 'Military-grade SHA-256 hashing creates a unique fingerprint for every medicine batch — mathematically impossible to clone.', 
      tags: ['SHA-256', 'Anti-Clone', 'Zero Collisions', 'FIPS 180-4'] 
    },
    { 
      icon: '⚡', 
      title: t('tech_section.frontend_title') || 'Next.js + React', 
      tag: t('tech_section.tag_frontend') || 'FRONTEND', 
      desc: t('tech_section.frontend_desc') || 'Lightning-fast Next.js frontend with server-side rendering ensures top Lighthouse scores and global CDN delivery.', 
      tags: ['Next.js 15', 'React 19', 'Tailwind CSS', 'PWA Ready'] 
    },
    { 
      icon: '🗄️', 
      title: t('tech_section.backend_title') || 'Node.js + MongoDB', 
      tag: t('tech_section.tag_backend') || 'BACKEND', 
      desc: t('tech_section.backend_desc') || 'High-performance Express API with MongoDB Atlas scales to millions of verification requests per day with sub-50ms response.', 
      tags: ['Express.js', 'MongoDB Atlas', 'JWT Auth', 'REST API'] 
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      <ParticleCanvas />
      <Navbar />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '40px 20px 60px' : '80px 48px 100px', maxWidth: '1300px', margin: '0 auto', display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1.1fr 0.9fr', gap: isMobile ? '32px' : '40px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>
              {t('hero.badge') || "BLOCKCHAIN VERIFICATION"}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '34px' : '54px', color: '#e3e1e9', lineHeight: 1.1, marginBottom: '20px' }}>
            {t('hero.title1') || "Authenticity"}<br />
            {t('hero.title2') || "You Can"} <span style={{ color: '#00dbe9', textShadow: '0 0 40px rgba(0,219,233,0.4)' }}>{t('hero.title3') || "Trust"}</span>
          </h1>

          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#849495', lineHeight: 1.8, marginBottom: '32px', maxWidth: '480px' }}>
            {t('hero.desc') || "Every medicine deserves a verified identity. MediVerify uses blockchain cryptography to instantly confirm authenticity — protecting millions of lives from counterfeit pharmaceuticals."}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: isMobile ? '32px' : '48px' }}>
            <button onClick={() => router.push('/scan')} style={{ padding: '16px 28px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,219,233,0.4)' }}>
              ⊡ {(t('hero.scan') || "SCAN MEDICINE").toUpperCase()}
            </button>
            <button onClick={() => router.push('/wallet')} style={{ padding: '16px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer' }}>
              {(t('hero.learn') || "LEARN MORE").toUpperCase()}
            </button>
          </div>

          <div style={{ display: 'flex', gap: isMobile ? '20px' : '40px', flexWrap: 'wrap' }}>
            {[{ val: 124, suf: 'K+', label: 'Batches Verified' }, { val: 98, suf: '%', label: 'Accuracy Rate' }, { val: 24, suf: '/7', label: 'Network Uptime' }].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: isMobile ? '24px' : '32px', color: '#00dbe9' }}>
                  <Counter end={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: '11px', color: '#5a6370', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: isMobile ? '220px' : '320px', height: isMobile ? '220px' : '320px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,219,233,0.15) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0,219,233,0.3)', boxShadow: '0 0 60px rgba(0,219,233,0.3)' }}>
              <Image src="/medicine-capsule.png" alt="Medicine capsule" fill style={{ objectFit: 'cover' }} priority />
            </div>
            <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '1px dashed rgba(0,219,233,0.25)', animation: 'spin 20s linear infinite' }} />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '20px 20px 50px' : '20px 48px 80px', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '24px' : '34px', color: '#e3e1e9', marginBottom: '12px' }}>
            {t('features_section.heading') || "Built for Trust"}
          </h2>
          <p style={{ fontSize: '14px', color: '#849495' }}>
            {t('features_section.subheading') || "Six pillars of protection, working together"}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }} />
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: '#e3e1e9', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '20px 20px 50px' : '20px 48px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '24px' : '34px', color: '#e3e1e9', marginBottom: '12px' }}>
            {t('process_section.heading') || "How It Works"}
          </h2>
          <p style={{ fontSize: '14px', color: '#849495' }}>
            {t('process_section.subheading') || "From factory to your hands — in three simple steps"}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '24px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', position: 'relative' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '40px', color: 'rgba(0,219,233,0.2)', marginBottom: '12px' }}>{s.num}</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: '#00dbe9', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ GLOBAL NETWORK ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '20px 20px 50px' : '20px 48px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: isMobile ? '24px' : '40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '22px' : '28px', color: '#e3e1e9', marginBottom: '8px' }}>
            {t('network_section.heading') || "Global Verification Network"}
          </h2>
          <p style={{ fontSize: '13px', color: '#849495', marginBottom: '24px' }}>
            {t('network_section.subheading') || "Active verification nodes across 47 countries"}
          </p>
          <svg viewBox="0 0 400 180" style={{ width: '100%', maxWidth: '500px', height: 'auto' }}>
            <path d="M30,60 Q60,50 90,65 Q100,80 80,95 Q50,100 30,85 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1" />
            <path d="M110,45 Q160,35 200,50 Q220,70 200,100 Q160,110 120,90 Q100,70 110,45 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1" />
            <path d="M230,55 Q280,45 320,60 Q340,80 320,110 Q280,120 240,100 Q220,80 230,55 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1" />
            <path d="M340,50 Q380,45 395,65 Q390,90 360,95 Q335,85 340,50 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1" />
            {[[80,70,'#00dbe9'],[160,55,'#00f5a0'],[280,70,'#00dbe9'],[370,65,'#ff4d6d'],[100,90,'#c5c4de'],[220,80,'#00dbe9']].map((n,i) => (
              <g key={i}>
                <circle cx={n[0]} cy={n[1]} r="9" fill={`${n[2]}15`} stroke={`${n[2]}40`} strokeWidth="1" />
                <circle cx={n[0]} cy={n[1]} r="3" fill={n[2]} />
              </g>
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', marginTop: '24px', flexWrap: 'wrap' }}>
            {[
              { val: 47, label: t('network_section.countries') || 'Countries' }, 
              { val: 4812, label: t('network_section.nodes') || 'Active Nodes' }, 
              { val: 99, suf: '%', label: t('network_section.health') || 'Network Health' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '22px', color: '#00f5a0' }}><Counter end={s.val} suffix={s.suf || ''} /></div>
                <div style={{ fontSize: '11px', color: '#5a6370' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECH STACK ══ */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '20px 20px 60px' : '20px 48px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '24px' : '34px', color: '#e3e1e9', marginBottom: '12px' }}>Engineering Behind The Trust</h2>
          <p style={{ fontSize: '14px', color: '#849495' }}>Production-grade technology, end to end</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          {techStack.map((t, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{t.icon}</div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e3e1e9' }}>{t.title}</h3>
                </div>
                <span style={{ background: 'rgba(0,219,233,0.1)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '6px', padding: '4px 10px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{t.tag}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.6, marginBottom: '14px' }}>{t.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {t.tags.map((tag, j) => (
                  <span key={j} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      {isMobile && <BottomNav />}

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}