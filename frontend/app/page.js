'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.4 + 0.1,
    }))
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.4, 0, canvas.width / 2, canvas.height * 0.4, 350)
      grd.addColorStop(0, 'rgba(0,219,233,0.07)'); grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,219,233,${p.opacity})`; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,219,233,${0.07 * (1 - dist / 90)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      ;[0.06, 0.94].forEach((xRatio, side) => {
        const hx = canvas.width * xRatio, amp = 20, hTop = canvas.height * 0.1, hH = canvas.height * 0.8
        ;[0, Math.PI].forEach((phase) => {
          ctx.beginPath()
          for (let i = 0; i <= 100; i++) {
            const prog = i / 100, y = hTop + prog * hH
            const xF = hx + Math.sin(prog * Math.PI * 5 + t + (side * 1.2) + phase) * amp * (side === 0 ? 1 : -1)
            i === 0 ? ctx.moveTo(xF, y) : ctx.lineTo(xF, y)
          }
          ctx.strokeStyle = `rgba(0,219,233,${phase === 0 ? 0.2 : 0.13})`; ctx.lineWidth = 1.5; ctx.stroke()
        })
        for (let i = 0; i <= 22; i++) {
          const prog = i / 22, y = hTop + prog * hH
          const x1 = hx + Math.sin(prog * Math.PI * 5 + t + (side * 1.2)) * amp * (side === 0 ? 1 : -1)
          const x2 = hx + Math.sin(prog * Math.PI * 5 + t + (side * 1.2) + Math.PI) * amp * (side === 0 ? 1 : -1)
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y)
          ctx.strokeStyle = 'rgba(0,219,233,0.1)'; ctx.lineWidth = 1; ctx.stroke()
          ;[x1, x2].forEach(x => { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,219,233,0.4)'; ctx.fill() })
        }
      })
      ;[{ x: 0.12, y: 0.18, s: 18, sp: 0.7 }, { x: 0.88, y: 0.12, s: 14, sp: 1.0 }, { x: 0.08, y: 0.72, s: 22, sp: 0.5 }, { x: 0.92, y: 0.78, s: 16, sp: 0.8 }].forEach(h => {
        ctx.save(); ctx.translate(canvas.width * h.x, canvas.height * h.y + Math.sin(t * h.sp) * 8)
        ctx.rotate(t * 0.25); ctx.beginPath()
        for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2; s === 0 ? ctx.moveTo(Math.cos(a) * h.s, Math.sin(a) * h.s) : ctx.lineTo(Math.cos(a) * h.s, Math.sin(a) * h.s) }
        ctx.closePath(); ctx.strokeStyle = 'rgba(0,219,233,0.13)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore()
      })
      t += 0.007; animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', width: '100%', height: '100%' }} />
}

function useScrollReveal() {
  const [visible, setVisible] = useState({})
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true })) })
    }, { threshold: 0.12 })
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    }, 100)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [])
  return visible
}

function BottomNav({ active }) {
  const router = useRouter()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 18px', background: 'rgba(10,11,16,0.97)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {[{ icon: '⌂', label: 'HOME', path: '/' }, { icon: '⊡', label: 'SCAN', path: '/scan' }, { icon: '◫', label: 'HISTORY', path: '/history' }, { icon: '⊞', label: 'BATCHES', path: '/batches' }, { icon: '◈', label: 'WALLET', path: '/wallet' }].map(item => (
        <button key={item.label} onClick={() => router.push(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: item.label === active ? 'rgba(0,219,233,0.12)' : 'transparent', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: '14px' }}>
          <span style={{ fontSize: '18px', filter: item.label === active ? 'drop-shadow(0 0 6px rgba(0,219,233,0.9))' : 'none' }}>{item.icon}</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.09em', color: item.label === active ? '#00dbe9' : '#5a6370' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function ExtraSections({ isMobile }) {
  const visible = useScrollReveal()
  const px = isMobile ? '20px' : '80px'
  const maxW = isMobile ? '480px' : '1400px'

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* HOW IT WORKS */}
      <section style={{ padding: `80px ${px}`, maxWidth: maxW, margin: '0 auto' }}>
        <div data-reveal id="s1h" style={{ textAlign: 'center', marginBottom: '52px', transform: visible['s1h'] ? 'translateY(0)' : 'translateY(30px)', opacity: visible['s1h'] ? 1 : 0, transition: 'all 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>HOW IT WORKS</span>
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '28px' : '42px', color: '#e3e1e9', marginBottom: '14px', lineHeight: 1.1 }}>Verify in <span style={{ color: '#00dbe9', textShadow: '0 0 30px rgba(0,219,233,0.4)' }}>3 Simple Steps</span></h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#849495', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>From scan to verified result in under a second. No expertise required.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '20px', position: 'relative' }}>
          {!isMobile && (
            <div data-reveal id="cline" style={{ position: 'absolute', top: '52px', left: '18%', right: '18%', height: '1px', background: 'linear-gradient(90deg, #00dbe9, rgba(0,219,233,0.3), #00dbe9)', transform: visible['cline'] ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 1s ease 0.5s', transformOrigin: 'left' }} />
          )}
          {[
            { num: 1, icon: '📷', title: 'Scan the QR Code', desc: 'Open Medi-Verify and point your camera at the medicine QR code or barcode. Works with any packaging worldwide.', delay: 0 },
            { num: 2, icon: '⛓️', title: 'Blockchain Query', desc: 'Our system instantly queries the Ethereum blockchain for the medicine SHA-256 cryptographic hash record.', delay: 150 },
            { num: 3, icon: '✅', title: 'Instant Result', desc: 'Receive AUTHENTIC or COUNTERFEIT verdict in 0.8 seconds with full supply chain transparency and proof.', delay: 300 },
          ].map(s => (
            <div key={s.num} data-reveal id={`st${s.num}`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px 24px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(16px)', transform: visible[`st${s.num}`] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)', opacity: visible[`st${s.num}`] ? 1 : 0, transition: `all 0.7s cubic-bezier(0.34,1.4,0.64,1) ${s.delay}ms` }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.5), transparent)' }} />
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '56px', lineHeight: 1, color: 'rgba(0,219,233,0.07)', userSelect: 'none' }}>{String(s.num).padStart(2, '0')}</div>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,219,233,0.15), rgba(0,219,233,0.05))', border: '1px solid rgba(0,219,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,219,233,0.12)' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#e3e1e9', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.7 }}>{s.desc}</p>
              <div style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 12px rgba(0,219,233,0.8)', zIndex: 2 }} />
            </div>
          ))}
        </div>

        <div data-reveal id="scta" style={{ textAlign: 'center', marginTop: '44px', transform: visible['scta'] ? 'translateY(0)' : 'translateY(20px)', opacity: visible['scta'] ? 1 : 0, transition: 'all 0.6s ease 0.4s' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(0,219,233,0.04)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '16px', padding: '14px 28px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 10px #00f5a0' }} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 600, color: '#b9cacb' }}>Average verification: <span style={{ color: '#00dbe9', fontWeight: 700 }}>0.8 seconds</span></span>
          </div>
        </div>
      </section>

      {/* GLOBAL NETWORK */}
      <section style={{ padding: `80px ${px}`, maxWidth: maxW, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(0,219,233,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div data-reveal id="s2h" style={{ textAlign: 'center', marginBottom: '52px', transform: visible['s2h'] ? 'translateY(0)' : 'translateY(30px)', opacity: visible['s2h'] ? 1 : 0, transition: 'all 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 8px #00f5a0' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00f5a0', letterSpacing: '0.14em' }}>GLOBAL IMPACT</span>
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '28px' : '42px', color: '#e3e1e9', marginBottom: '14px', lineHeight: 1.1 }}>Protecting Patients <span style={{ color: '#00f5a0', textShadow: '0 0 30px rgba(0,245,160,0.3)' }}>Worldwide</span></h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#849495', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>Real-time pharmaceutical authentication across 47 countries and growing every day.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: '🌍', val: '47', label: 'Countries', sub: 'Active globally', color: '#00dbe9', delay: 0 },
            { icon: '💊', val: '2.1M', label: 'Medicines', sub: 'Verified this month', color: '#00f5a0', delay: 100 },
            { icon: '🏭', val: '380+', label: 'Manufacturers', sub: 'Registered on-chain', color: '#c5c4de', delay: 200 },
            { icon: '⚠️', val: '12K', label: 'Fakes Blocked', sub: 'Prevented this year', color: '#ff4d6d', delay: 300 },
          ].map((s, i) => (
            <div key={i} data-reveal id={`stat${i}`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: `1px solid ${s.color}25`, borderRadius: '20px', padding: '24px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transform: visible[`stat${i}`] ? 'translateY(0)' : 'translateY(30px)', opacity: visible[`stat${i}`] ? 1 : 0, transition: `all 0.6s ease ${s.delay}ms` }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '34px', color: s.color, lineHeight: 1, marginBottom: '6px' }}>{s.val}</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: '#e3e1e9', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: '#5a6370' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div data-reveal id="globe" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: isMobile ? '28px 16px' : '44px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transform: visible['globe'] ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)', opacity: visible['globe'] ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.34,1.2,0.64,1)' }}>
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.4), transparent)' }} />
          <div style={{ position: 'relative', height: isMobile ? '180px' : '240px', marginBottom: '24px' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              {[20, 40, 60, 80].map(y => <ellipse key={y} cx="50%" cy={`${y}%`} rx="48%" ry="8%" fill="none" stroke="rgba(0,219,233,0.06)" strokeWidth="1" />)}
              {[10, 25, 40, 55, 70, 85].map(x => <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(0,219,233,0.05)" strokeWidth="1" />)}
              {[[15,30,45,60],[20,50,70,40],[60,25,80,55],[35,70,55,30],[75,45,25,65]].map(([x1,y1,x2,y2],i) => <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="rgba(0,219,233,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />)}
              {[[15,30,'#00dbe9'],[45,60,'#00dbe9'],[70,40,'#00f5a0'],[35,70,'#00dbe9'],[80,55,'#ff4d6d'],[25,65,'#00f5a0'],[55,30,'#00dbe9'],[88,25,'#00dbe9']].map(([x,y,c],i) => (
                <g key={i}><circle cx={`${x}%`} cy={`${y}%`} r="8" fill={`${c}15`} stroke={`${c}40`} strokeWidth="1" /><circle cx={`${x}%`} cy={`${y}%`} r="3" fill={c} /></g>
              ))}
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: isMobile ? '12px' : '14px', fontWeight: 600, color: '#00dbe9', letterSpacing: '0.1em' }}>GLOBAL VERIFICATION NETWORK</div>
              <div style={{ fontSize: '12px', color: '#5a6370', marginTop: '4px' }}>4,812 Active Nodes • 42ms Avg Latency</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[{ l: '🌏 Asia Pacific', c: '1,842', col: '#00dbe9' }, { l: '🌍 Europe', c: '1,204', col: '#00f5a0' }, { l: '🌎 Americas', c: '980', col: '#c5c4de' }, { l: '🌍 Middle East', c: '492', col: '#00dbe9' }, { l: '🌍 Africa', c: '294', col: '#ff4d6d' }].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '6px 12px' }}>
                <span style={{ fontSize: '12px' }}>{r.l}</span>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: r.col }}>{r.c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding: `80px ${px}`, maxWidth: maxW, margin: '0 auto' }}>
        <div data-reveal id="s3h" style={{ textAlign: 'center', marginBottom: '52px', transform: visible['s3h'] ? 'translateY(0)' : 'translateY(30px)', opacity: visible['s3h'] ? 1 : 0, transition: 'all 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(197,196,222,0.06)', border: '1px solid rgba(197,196,222,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c5c4de', boxShadow: '0 0 8px #c5c4de' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#c5c4de', letterSpacing: '0.14em' }}>POWERED BY</span>
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '28px' : '42px', color: '#e3e1e9', marginBottom: '14px', lineHeight: 1.1 }}>Enterprise-Grade <span style={{ color: '#c5c4de' }}>Tech Stack</span></h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#849495', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>Built on battle-tested technologies trusted by Fortune 500 healthcare companies.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: '16px' }}>
          {[
            { icon: '⛓️', title: 'Ethereum Blockchain', badge: 'SOLIDITY', color: '#627EEA', desc: 'Smart contracts on Ethereum mainnet ensure tamper-proof medicine registration. Every batch hash is permanently immutable.', tags: ['Smart Contracts', 'ERC-721', 'Hardhat', 'Web3.js'] },
            { icon: '🔐', title: 'SHA-256 Cryptography', badge: 'SECURITY', color: '#00dbe9', desc: 'Military-grade SHA-256 hashing creates a unique fingerprint for every medicine batch — mathematically impossible to clone.', tags: ['SHA-256', 'Anti-Clone', 'Zero Collisions', 'FIPS 180-4'] },
            { icon: '⚛️', title: 'Next.js + React', badge: 'FRONTEND', color: '#00f5a0', desc: 'Lightning-fast Next.js frontend with server-side rendering ensures 100/100 Lighthouse scores and global CDN delivery.', tags: ['Next.js 15', 'React 19', 'Tailwind CSS', 'PWA Ready'] },
            { icon: '🍃', title: 'Node.js + MongoDB', badge: 'BACKEND', color: '#c5c4de', desc: 'High-performance Express API with MongoDB Atlas scales to millions of verification requests per day with sub-50ms response.', tags: ['Express.js', 'MongoDB Atlas', 'JWT Auth', 'REST API'] },
          ].map((t, i) => (
            <div key={i} data-reveal id={`tech${i}`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transform: visible[`tech${i}`] ? 'translateX(0)' : `translateX(${i % 2 === 0 ? '-30px' : '30px'})`, opacity: visible[`tech${i}`] ? 1 : 0, transition: `all 0.7s cubic-bezier(0.34,1.2,0.64,1) ${i * 100}ms` }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${t.color}60, transparent)` }} />
              <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: `linear-gradient(180deg, transparent, ${t.color}, transparent)`, borderRadius: '0 4px 4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${t.color}15`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{t.icon}</div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 700, color: '#e3e1e9' }}>{t.title}</h3>
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: t.color, background: `${t.color}15`, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${t.color}30`, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{t.badge}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.7, marginBottom: '16px' }}>{t.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {t.tags.map((tag, j) => <span key={j} style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: '#b9cacb', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '4px 12px' }}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: `32px ${px} ${isMobile ? '100px' : '40px'}`, maxWidth: maxW, margin: '0 auto' }}>
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1fr auto 1fr', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,219,233,0.1)', border: '1px solid rgba(0,219,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🔬</div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#00dbe9', letterSpacing: '0.08em' }}>MEDI-VERIFY</span>
          </div>
          <p style={{ fontSize: '12px', color: '#5a6370', textAlign: 'center', lineHeight: 1.6 }}>
            © 2026 MediVerify. Blockchain-powered pharmaceutical authentication.<br />
            <span style={{ color: '#3b494b' }}>Built for a counterfeit-free world. 🌍</span>
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: isMobile ? 'center' : 'flex-end' }}>
            {['Privacy', 'Terms', 'Docs', 'Contact'].map(link => <span key={link} style={{ fontSize: '12px', color: '#5a6370', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, letterSpacing: '0.05em' }}>{link}</span>)}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scanY, setScanY] = useState(20)
  const [counts, setCounts] = useState({ b: 0, s: 0, t: 0 })
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let dir = 1, pos = 20
    const si = setInterval(() => { pos += dir * 1.5; if (pos >= 82) dir = -1; if (pos <= 18) dir = 1; setScanY(pos) }, 28)
    let b = 0, s = 0, t = 0
    const ci = setInterval(() => { b = Math.min(b + 4, 124); s = Math.min(s + 3, 98); t = Math.min(t + 1, 24); setCounts({ b, s, t }); if (b >= 124 && s >= 98 && t >= 24) clearInterval(ci) }, 25)
    return () => { clearInterval(si); clearInterval(ci) }
  }, [])

  const HeroImage = () => (
    <div style={{ position: 'relative', width: isMobile ? '220px' : '300px', height: isMobile ? '220px' : '300px' }}>
      <div style={{ position: 'absolute', inset: '-16px', borderRadius: '50%', border: '1px solid rgba(0,219,233,0.1)', animation: 'ringPulse 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(0,219,233,0.18)' }} />
      <div style={{ position: 'absolute', top: '8px', right: '-4px', width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#00dbe9' }}>✦</div>
      <div style={{ position: 'absolute', bottom: '16px', left: '-8px', width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#849495' }}>⚙</div>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,219,233,0.25), 0 0 120px rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.25)' }}>
        <Image src="/medicine-capsule.png" alt="3D Medicine Capsule" fill style={{ objectFit: 'cover' }} priority />
        <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00dbe9, #00f0ff, #00dbe9, transparent)', boxShadow: '0 0 14px rgba(0,219,233,1)', top: `${scanY}%`, transition: 'top 0.028s linear' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent, rgba(0,10,15,0.4))' }} />
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B10', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
        <ParticleCanvas />
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(10,11,16,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,219,233,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,219,233,0.25), rgba(0,219,233,0.05))', border: '1px solid rgba(0,219,233,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔬</div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: '#00dbe9', letterSpacing: '0.08em' }}>MEDI-VERIFY</span>
          </div>
          <button onClick={() => router.push('/wallet')} style={{ background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.3)', borderRadius: '10px', padding: '8px 16px', color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>⬡ CONNECT</button>
        </nav>

        <main style={{ flex: 1, padding: '0 20px', maxWidth: '480px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}><HeroImage /></div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '4px 14px', marginBottom: '16px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
              <span style={{ fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em' }}>BLOCKCHAIN VERIFIED</span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(28px,9vw,38px)', lineHeight: 1.1, color: '#e3e1e9', marginBottom: '4px' }}>Authenticity You</h1>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(28px,9vw,38px)', lineHeight: 1.1, color: '#00dbe9', textShadow: '0 0 30px rgba(0,219,233,0.5)', marginBottom: '16px' }}>Can Trust</h1>
            <p style={{ fontSize: '14px', color: '#849495', lineHeight: 1.7, maxWidth: '300px', margin: '0 auto 28px' }}>Blockchain-backed medicine verification for a safer world. Instantly validate pharmaceuticals using secure ledger technology.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button onClick={() => router.push('/scan')} style={{ width: '100%', padding: '16px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 24px rgba(0,219,233,0.45)' }}>GET STARTED</button>
            <button style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.12em', cursor: 'pointer' }}>LEARN MORE</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
            {[{ val: `${counts.b}K`, label: 'Batches', color: '#00dbe9' }, { val: `${counts.s}%`, label: 'Uptime', color: '#00f5a0' }, { val: `${counts.t}.4M+`, label: 'Users', color: '#c5c4de' }].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 8px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: '#5a6370', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.4), transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🗄️</div>
                <span style={{ fontSize: '9px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: '#00dbe9', background: 'rgba(0,219,233,0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0,219,233,0.15)' }}>LIVE LEDGER</span>
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 600, color: '#e3e1e9', marginBottom: '8px' }}>Immutable Security</h3>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.6 }}>Every batch is recorded on a decentralized ledger, preventing counterfeit distribution worldwide.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[{ icon: '⚡', val: '0.8s', label: 'Avg. Verification Speed' }, { icon: '🛡️', val: '100%', label: 'Traceability Rate' }].map((c, i) => (
                <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
                  <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }} />
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '12px' }}>{c.icon}</div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '24px', color: '#e3e1e9' }}>{c.val}</div>
                  <div style={{ fontSize: '11px', color: '#849495', marginTop: '4px', lineHeight: 1.4 }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex' }}>
                {['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️'].map((e, i) => <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,219,233,0.1)', border: '2px solid #0a0b10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginLeft: i > 0 ? '-8px' : '0' }}>{e}</div>)}
              </div>
              <p style={{ fontSize: '13px', color: '#b9cacb' }}>Trusted by <span style={{ color: '#e3e1e9', fontWeight: 600 }}>2.4M+</span> healthcare providers globally.</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(0,219,233,0.07), rgba(0,219,233,0.02))', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '16px', padding: '20px', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🔐</span>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.06em' }}>SHA-256 ANTI-CLONE</span>
              </div>
              <p style={{ fontSize: '12px', color: '#849495', lineHeight: 1.6 }}>Every medicine batch gets a unique cryptographic hash recorded immutably on-chain. Cloning is mathematically impossible.</p>
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', color: '#00dbe9' }}>0x7f3a9c...e4b2 ✓ IMMUTABLE</div>
            </div>
          </div>
        </main>

        <ExtraSections isMobile={true} />
        <BottomNav active="HOME" />
        <style>{`@keyframes ringPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <ParticleCanvas />
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', background: 'rgba(10,11,16,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,219,233,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,219,233,0.25), rgba(0,219,233,0.05))', border: '1px solid rgba(0,219,233,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔬</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: '#00dbe9', letterSpacing: '0.08em' }}>MEDI-VERIFY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['Home', 'Features', 'Dashboard', 'About'].map(link => <button key={link} style={{ background: 'transparent', border: 'none', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', letterSpacing: '0.05em' }}>{link}</button>)}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}>DASHBOARD</button>
          <button onClick={() => router.push('/wallet')} style={{ background: '#00dbe9', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,219,233,0.3)' }}>⬡ CONNECT WALLET</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', padding: '80px 80px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '6px 16px', marginBottom: '28px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>BLOCKCHAIN-POWERED AUTHENTICATION</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(38px,4vw,62px)', lineHeight: 1.05, color: '#e3e1e9', marginBottom: '8px' }}>Authenticity<br />You</h1>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(38px,4vw,62px)', lineHeight: 1.05, color: '#00dbe9', textShadow: '0 0 40px rgba(0,219,233,0.4)', marginBottom: '24px' }}>Can Trust</h1>
          <p style={{ fontSize: '16px', color: '#849495', lineHeight: 1.8, maxWidth: '460px', marginBottom: '40px' }}>The world's most advanced pharmaceutical authentication platform. Every medicine verified, every batch secured, every patient protected using immutable blockchain technology.</p>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '52px' }}>
            <button onClick={() => router.push('/scan')} style={{ padding: '16px 36px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.12em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,219,233,0.4)' }}>SCAN MEDICINE</button>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '16px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.12em', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>VIEW DASHBOARD</button>
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
            {[{ val: `${counts.b}K+`, label: 'Batches Verified', color: '#00dbe9' }, { val: `${counts.s}%`, label: 'Network Uptime', color: '#00f5a0' }, { val: `${counts.t}.4M+`, label: 'Users Globally', color: '#c5c4de' }].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '12px', color: '#5a6370', marginTop: '6px', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,219,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <HeroImage />
          <div style={{ position: 'absolute', top: '20px', right: '0', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px', minWidth: '180px' }}>
            <div style={{ fontSize: '10px', color: '#849495', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>LIVE VERIFICATION</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 8px #00f5a0' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#00f5a0' }}>AUTHENTIC</span>
            </div>
            <div style={{ fontSize: '11px', color: '#5a6370', marginTop: '4px' }}>Amoxicillin CL 500mg</div>
          </div>
          <div style={{ position: 'absolute', bottom: '30px', left: '0', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '16px', padding: '14px 18px' }}>
            <div style={{ fontSize: '10px', color: '#849495', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>BLOCKCHAIN HASH</div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00dbe9' }}>0x7f3a9c...e4b2</div>
            <div style={{ fontSize: '10px', color: '#00f5a0', marginTop: '4px' }}>✓ Immutable Record</div>
          </div>
          <div style={{ position: 'absolute', top: '50%', right: '-10px', transform: 'translateY(-50%)', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#00dbe9' }}>0.8s</div>
            <div style={{ fontSize: '10px', color: '#849495', marginTop: '2px' }}>Verify Speed</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '0 80px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: '#e3e1e9', marginBottom: '12px' }}>Why MediVerify?</h2>
          <p style={{ fontSize: '15px', color: '#849495', maxWidth: '480px', margin: '0 auto' }}>Enterprise-grade pharmaceutical security powered by cutting-edge blockchain technology.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {[{ icon: '🗄️', title: 'Immutable Ledger', desc: 'Every batch permanently recorded. No tampering, ever.', badge: 'LIVE' }, { icon: '⚡', title: '0.8s Verify', desc: 'Industry-fastest pharmaceutical authentication speed.', badge: 'FAST' }, { icon: '🛡️', title: '100% Traceable', desc: 'Full supply chain visibility from factory to patient.', badge: 'SECURE' }, { icon: '🔐', title: 'SHA-256 Hash', desc: 'Unique cryptographic fingerprint prevents all cloning.', badge: 'ENCRYPTED' }].map((c, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.4), transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{c.icon}</div>
                <span style={{ fontSize: '9px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#00dbe9', background: 'rgba(0,219,233,0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0,219,233,0.15)', letterSpacing: '0.1em' }}>{c.badge}</span>
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: '#e3e1e9', marginBottom: '10px' }}>{c.title}</h3>
              <p style={{ fontSize: '13px', color: '#849495', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <ExtraSections isMobile={false} />
      <style>{`@keyframes ringPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}`}</style>
    </div>
  )
}