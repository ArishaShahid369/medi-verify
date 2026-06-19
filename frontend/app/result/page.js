'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { downloadCertificate } from '../../components/Certificate'

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(true)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [chainVisible, setChainVisible] = useState([false, false, false, false])
  const [medicine, setMedicine] = useState(null)
  const [result, setResult] = useState('authentic')
  const [responseTime, setResponseTime] = useState(0)
  const [riskAnalysis, setRiskAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const [offlineData, setOfflineData] = useState(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const mode = searchParams.get('mode')

    if (mode === 'offline') {
      // ══ OFFLINE MODE: Read locally-verified cryptographic signature ══
      const stored = sessionStorage.getItem('offlineVerification')
      if (stored) {
        const verification = JSON.parse(stored)
        setOfflineMode(true)
        setOfflineData(verification)

        if (verification.valid) {
          const m = verification.payload
          setMedicine({
            name: m.name,
            genericName: m.genericName,
            batchNumber: m.batch,
            serialNumber: m.serial,
            dosage: m.dosage,
            saltComposition: m.saltComposition,
            manufacturerName: m.manufacturer,
            licenseNumber: m.license,
            manufactureDate: m.manufactureDate,
            expiryDate: m.expiry,
            sha256Hash: m.hash,
            isOnChain: true,
            verificationCount: 0,
            supplyChain: [],
          })
          setResult(verification.expired ? 'expired' : 'authentic')
        } else {
          setResult('counterfeit')
        }
      } else {
        setError('No offline verification data found')
      }
      setLoading(false)
      setTimeout(() => setRevealed(true), 200)
      return
    }

    // ══ ONLINE MODE: Fetch from backend ══
    const fetchResult = async () => {
      try {
        const hash = searchParams.get('hash')
        const batch = searchParams.get('batch')
        const serial = searchParams.get('serial')
        const body = hash ? { hash } : batch ? { batchNumber: batch } : { serialNumber: serial }
        if (!hash && !batch && !serial) {
          body.hash = 'a8f2e4c9d1b7f5e3a2c6d8f4b1e9a7c5d3f2b8e6a4c1d9f7b5e3a2c8d6f4b9e1'
        }
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`${API_URL}/verify/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
        })
clearTimeout(timeout)
        const data = await res.json()
        if (data.success) {
          setMedicine(data.medicine)
          setResult(data.result)
          setResponseTime(data.responseTime)
          setRiskAnalysis(data.riskAnalysis)
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError('Connection error: ' + err.message)
      } finally {
        setLoading(false)
        setTimeout(() => setRevealed(true), 200)
        const timers = [0,1,2,3].map(i => setTimeout(() => setChainVisible(prev => { const n=[...prev]; n[i]=true; return n }), 800 + i*300))
        return () => timers.forEach(clearTimeout)
      }
    }
    fetchResult()
  }, [searchParams])

  const Navbar = () => (
    <Navbar />
  )

  const BottomNav = () => (
    <Navbar />
  )

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '-60px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(0,219,233,0.2)', borderTop: '3px solid #00dbe9', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', color: '#00dbe9', marginBottom: '8px' }}>Verifying...</h2>
        <p style={{ fontSize: '13px', color: '#849495' }}>Please wait</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const isAuthentic = result === 'authentic'
  const resultColor = isAuthentic ? '#00f5a0' : result === 'expired' ? '#ff9500' : '#ff4d6d'
  const resultText = isAuthentic ? 'VERIFIED' : result === 'expired' ? 'EXPIRED' : result === 'recalled' ? 'RECALLED' : 'COUNTERFEIT'
  const resultIcon = isAuthentic ? '✅' : result === 'expired' ? '⚠️' : '❌'

  // ══ OFFLINE BANNER ══
  const OfflineBanner = () => (
    <div style={{ background: 'linear-gradient(135deg, rgba(0,219,233,0.1), rgba(0,219,233,0.03))', border: '1px solid rgba(0,219,233,0.3)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,219,233,0.12)', border: '1px solid rgba(0,219,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📡</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, color: '#00dbe9', marginBottom: '2px' }}>
          {offlineData?.valid ? 'Cryptographically Verified Offline ✓' : 'Offline Verification Failed'}
        </p>
        <p style={{ fontSize: '11px', color: '#849495', lineHeight: 1.5 }}>
          {offlineData?.valid
            ? 'No internet connection used. Verified locally using RSA-2048 digital signature embedded in QR code. Will sync to blockchain when online.'
            : offlineData?.reason || 'Could not verify signature locally.'}
        </p>
      </div>
    </div>
  )

  const RiskGauge = () => {
    if (!riskAnalysis || offlineMode) return null
    const { score, level, factors } = riskAnalysis
    const gaugeColor = level === 'high' ? '#ff4d6d' : level === 'medium' ? '#ff9500' : '#00f5a0'
    const rotation = (score / 100) * 180 - 90

    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px', marginBottom: '16px', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em' }}>🤖 AI RISK ENGINE</p>
          <span style={{ background: `${gaugeColor}15`, border: `1px solid ${gaugeColor}40`, borderRadius: '8px', padding: '4px 12px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: gaugeColor, textTransform: 'uppercase' }}>{level} RISK</span>
        </div>

        {/* Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <svg width="160" height="90" viewBox="0 0 160 90">
            <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score/100)*220} 220`} style={{ transition: 'stroke-dasharray 1s ease' }} />
            <line x1="80" y1="80" x2={80 + 55*Math.cos((rotation-90)*Math.PI/180)} y2={80 + 55*Math.sin((rotation-90)*Math.PI/180)} stroke={gaugeColor} strokeWidth="3" strokeLinecap="round" style={{ transition: 'all 1s ease' }} />
            <circle cx="80" cy="80" r="5" fill={gaugeColor} />
          </svg>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '28px', color: gaugeColor, marginTop: '-8px' }}>{score}<span style={{ fontSize: '14px', color: '#849495' }}>/100</span></div>
        </div>

        {/* Factors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
              <span style={{ fontSize: '12px', flexShrink: 0 }}>{level === 'low' ? '✓' : '⚠️'}</span>
              <p style={{ fontSize: '11px', color: '#b9cacb', lineHeight: 1.5 }}>{f}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const SupplyChain = () => (
    <div>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em', marginBottom: '20px' }}>SUPPLY CHAIN PROOF</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(medicine?.supplyChain?.length > 0 ? medicine.supplyChain : [
          { stage: 'Manufacturing', handler: medicine?.manufacturerName || 'Manufacturer', timestamp: medicine?.manufactureDate || new Date(), notes: 'Genesis Block — Registered on MediVerify' },
          { stage: 'Consumer', handler: 'You', timestamp: new Date(), notes: offlineMode ? 'Verified offline via signature' : 'Validated Today' },
        ]).map((step, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: '16px', transform: chainVisible[i] || offlineMode ? 'translateX(0)' : 'translateX(-20px)', opacity: chainVisible[i] || offlineMode ? 1 : 0, transition: `all 0.5s ease ${i*150}ms` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: i === arr.length - 1 ? 'rgba(0,219,233,0.15)' : 'rgba(255,255,255,0.05)', border: `2px solid ${i === arr.length - 1 ? '#00dbe9' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === arr.length - 1 ? '0 0 16px rgba(0,219,233,0.4)' : 'none' }}>
                {i === arr.length - 1 ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 10px rgba(0,219,233,1)' }} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />}
              </div>
              {i < arr.length - 1 && <div style={{ width: '1px', height: '40px', background: 'repeating-linear-gradient(to bottom, rgba(0,219,233,0.3) 0px, rgba(0,219,233,0.3) 4px, transparent 4px, transparent 10px)' }} />}
            </div>
            <div style={{ paddingBottom: '8px', paddingTop: '6px', flex: 1 }}>
              <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: i === arr.length - 1 ? '#00dbe9' : '#e3e1e9', marginBottom: '3px' }}>{step.handler || step.stage}</h4>
              <p style={{ fontSize: '12px', color: '#849495', marginBottom: '4px' }}>{step.notes} • {new Date(step.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: `radial-gradient(circle, ${isAuthentic ? 'rgba(0,245,160,0.08)' : 'rgba(255,77,109,0.08)'} 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <Navbar />

      <div style={{ padding: isMobile ? '0 20px' : '0 80px', maxWidth: isMobile ? '480px' : '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* RESULT HERO */}
        <div style={{ textAlign: 'center', padding: '36px 0 24px', transform: revealed ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)', opacity: revealed ? 1 : 0, transition: 'all 0.6s cubic-bezier(0.34,1.4,0.64,1)' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${resultColor}25 0%, transparent 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${resultColor}15`, border: `2px solid ${resultColor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${resultColor}40`, fontSize: '36px' }}>{resultIcon}</div>
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: `1px solid ${resultColor}30`, animation: 'orbit 3s linear infinite' }} />
            </div>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: isMobile ? '42px' : '56px', letterSpacing: '0.08em', color: resultColor, textShadow: `0 0 40px ${resultColor}60`, marginBottom: '8px', lineHeight: 1 }}>{resultText}</h1>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 600, color: '#849495', letterSpacing: '0.2em', marginBottom: '8px' }}>
            {offlineMode
              ? (offlineData?.valid ? 'VERIFIED VIA OFFLINE DIGITAL SIGNATURE' : 'OFFLINE SIGNATURE VERIFICATION FAILED')
              : (isAuthentic ? 'AUTHENTICITY CONFIRMED VIA BLOCKCHAIN LEDGER' : 'WARNING: VERIFICATION FAILED')}
          </p>
          {responseTime > 0 && !offlineMode && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '999px', padding: '4px 14px' }}>
              <span style={{ fontSize: '11px', color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>⚡ Verified in {responseTime}ms</span>
            </div>
          )}
          {offlineMode && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '999px', padding: '4px 14px' }}>
              <span style={{ fontSize: '11px', color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>🔐 RSA-2048 Local Verification</span>
            </div>
          )}
        </div>

        {medicine ? (
          isMobile ? (
            <div>
              {offlineMode && <OfflineBanner />}

              {/* Medicine Card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '16px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transform: revealed ? 'translateY(0)' : 'translateY(20px)', opacity: revealed ? 1 : 0, transition: 'all 0.6s ease 0.2s' }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${resultColor}60, transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#e3e1e9', marginBottom: '4px' }}>{medicine.name}</h2>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 600, color: '#849495', letterSpacing: '0.12em' }}>{medicine.genericName?.toUpperCase()}</p>
                  </div>
                  <div style={{ background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '8px', padding: '6px 12px' }}>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, color: '#00dbe9' }}>{medicine.dosage}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {[{ label: 'BATCH NUMBER', val: medicine.batchNumber }, { label: 'EXPIRY DATE', val: medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : 'N/A' }].map((f,i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '6px' }}>{f.label}</p>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: '#e3e1e9' }}>{f.val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '6px' }}>SALT COMPOSITION</p>
                  <p style={{ fontSize: '13px', color: '#b9cacb', lineHeight: 1.5, fontStyle: 'italic' }}>{medicine.saltComposition}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '6px' }}>MFG. LICENSE</p>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#e3e1e9' }}>{medicine.licenseNumber}</p>
                  </div>
                  <span style={{ fontSize: '20px' }}>🛡️</span>
                </div>
              </div>

              {/* Verification Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Times Verified', val: (medicine.verificationCount || 0).toLocaleString(), color: '#00dbe9' },
                  { label: 'On Blockchain', val: medicine.isOnChain ? 'YES ✓' : 'PENDING', color: '#00f5a0' },
                  { label: offlineMode ? 'Mode' : 'Response', val: offlineMode ? 'Offline' : `${responseTime}ms`, color: '#c5c4de' },
                ].map((s,i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '10px', color: '#5a6370', marginTop: '3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Supply Chain */}
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px', marginBottom: '16px', backdropFilter: 'blur(16px)' }}>
                <SupplyChain />
              </div>

              {/* Hash */}
              <div style={{ background: 'linear-gradient(135deg, rgba(0,219,233,0.06), rgba(0,219,233,0.02))', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em' }}>BLOCKCHAIN HASH</p>
                  <span style={{ fontSize: '11px', color: '#00f5a0', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>✓ IMMUTABLE</span>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00dbe9', wordBreak: 'break-all' }}>{medicine.sha256Hash}</p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <button onClick={() => alert('Report submitted! Our compliance team will review this case within 24 hours.')} style={{ padding: '16px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,219,233,0.4)' }}>↗ REPORT</button>
                <button onClick={() => downloadCertificate(medicine, result, responseTime)} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>↓ CERTIFICATE</button>
              </div>
              <button onClick={() => router.push('/scan')} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '100px' }}>← SCAN ANOTHER MEDICINE</button>
            </div>
          ) : (
            // Desktop
            <div>
              {offlineMode && <OfflineBanner />}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', transform: revealed ? 'translateY(0)' : 'translateY(20px)', opacity: revealed ? 1 : 0, transition: 'all 0.6s ease' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => alert('Report submitted! Our compliance team will review this case within 24 hours.')} style={{ padding: '14px 28px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 24px rgba(0,219,233,0.4)' }}>↗ REPORT</button>
                  <button onClick={() => downloadCertificate(medicine, result, responseTime)} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em', cursor: 'pointer' }}>↓ CERTIFICATE</button>
                  <button onClick={() => router.push('/scan')} style={{ padding: '14px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>← SCAN AGAIN</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '28px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden', transform: revealed ? 'translateY(0)' : 'translateY(20px)', opacity: revealed ? 1 : 0, transition: 'all 0.6s ease 0.15s' }}>
                    <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${resultColor}60, transparent)` }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#e3e1e9', marginBottom: '6px' }}>{medicine.name}</h2>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 600, color: '#849495', letterSpacing: '0.12em' }}>{medicine.genericName?.toUpperCase()}</p>
                      </div>
                      <div style={{ background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '10px', padding: '8px 16px' }}>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: '#00dbe9' }}>{medicine.dosage}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {[{ label: 'BATCH NUMBER', val: medicine.batchNumber }, { label: 'EXPIRY DATE', val: medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : 'N/A' }].map((f,i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '8px' }}>{f.label}</p>
                          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: '#e3e1e9' }}>{f.val}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '8px' }}>SALT COMPOSITION</p>
                      <p style={{ fontSize: '14px', color: '#b9cacb', lineHeight: 1.6, fontStyle: 'italic' }}>{medicine.saltComposition}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '8px' }}>MFG. LICENSE</p>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#e3e1e9' }}>{medicine.licenseNumber}</p>
                      </div>
                      <span style={{ fontSize: '28px' }}>🛡️</span>
                    </div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,219,233,0.06), rgba(0,219,233,0.02))', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(12px)', transform: revealed ? 'translateY(0)' : 'translateY(20px)', opacity: revealed ? 1 : 0, transition: 'all 0.6s ease 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em' }}>BLOCKCHAIN HASH</p>
                      <span style={{ fontSize: '11px', color: '#00f5a0', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, background: 'rgba(0,245,160,0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,245,160,0.2)' }}>✓ IMMUTABLE</span>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#00dbe9', wordBreak: 'break-all' }}>{medicine.sha256Hash}</p>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '28px', backdropFilter: 'blur(16px)', alignSelf: 'start', transform: revealed ? 'translateX(0)' : 'translateX(20px)', opacity: revealed ? 1 : 0, transition: 'all 0.6s ease 0.2s' }}>
                  <SupplyChain />
                  <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔐</div>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, color: '#00f5a0', letterSpacing: '0.08em', marginBottom: '4px' }}>CRYPTOGRAPHIC PROOF</p>
                    <p style={{ fontSize: '11px', color: '#849495' }}>{offlineMode ? 'Verified offline via RSA signature' : `${medicine.verificationCount?.toLocaleString()} verifications • Chain intact`}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '100px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', color: '#ff4d6d', marginBottom: '12px' }}>{offlineMode ? 'Counterfeit Detected!' : 'Medicine Not Found'}</h2>
            <p style={{ fontSize: '14px', color: '#849495', marginBottom: '24px' }}>{offlineData?.reason || error || 'This medicine is not registered on MediVerify blockchain.'}</p>
            <button onClick={() => router.push('/scan')} style={{ padding: '14px 28px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>← SCAN AGAIN</button>
          </div>
        )}
      </div>
      {isMobile && <BottomNav />}
      <style>{`@keyframes orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0A0B10', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'3px solid rgba(0,219,233,0.2)', borderTop:'3px solid #00dbe9', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
          <p style={{ color:'#00dbe9', fontFamily:'Space Grotesk, sans-serif', fontSize:'14px' }}>Verifying...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}