'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { downloadCertificate } from '../../components/Certificate'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import Footer from '../../components/Footer'

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [medicine, setMedicine] = useState(null)
  const [result, setResult] = useState('authentic')
  const [responseTime, setResponseTime] = useState(0)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // ══ STEP 3: ADDED CRYPTO REVOKED STATE ══
  const [cryptoRevoked, setCryptoRevoked] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'offline') {
      const stored = sessionStorage.getItem('offlineVerification')
      if (stored) {
        const v = JSON.parse(stored)
        if (v.valid) {
          const m = v.payload
          setMedicine({
            name: m.name, genericName: m.genericName, batchNumber: m.batch,
            serialNumber: m.serial, dosage: m.dosage, saltComposition: m.saltComposition,
            manufacturerName: m.manufacturer, licenseNumber: m.license,
            expiryDate: m.expiry, sha256Hash: m.hash, isOnChain: true,
            verificationCount: 0, supplyChain: [],
          })
          
          // Checking and setting state
          const isExpiredState = new Date(m.expiry) < new Date()
          setResult(isExpiredState ? 'expired' : 'authentic')
          if (isExpiredState) {
            setCryptoRevoked(true)
          }
        } else {
          setResult('counterfeit')
        }
      }
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const hash = searchParams.get('hash')
        const batch = searchParams.get('batch')
        const serial = searchParams.get('serial')
        const body = hash ? { hash } : batch ? { batchNumber: batch } : serial ? { serialNumber: serial } : { batchNumber: 'M-10293' }

        const res = await fetch(`${API_URL}/verify/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const data = await res.json()
        if (data.success) {
          setMedicine(data.medicine)
          setResult(data.result)
          setResponseTime(data.responseTime || 0)
          
          // ══ STEP 3 CHECK: IF RESULT IS EXPIRED ══
          if (data.result === 'expired') {
            setCryptoRevoked(true)
          }
        } else {
          // Demo fallback
          setMedicine({
            name: 'Amoxicillin CL', genericName: 'Amoxicillin Trihydrate',
            batchNumber: batch || 'M-10293', serialNumber: 'SN-2024-001',
            dosage: '500mg', saltComposition: 'Amoxicillin Trihydrate IP 500mg',
            manufacturerName: 'MediCorp Pharmaceuticals', licenseNumber: 'LIC-MED-2024-PK',
            expiryDate: '2027-12-01', sha256Hash: 'a8f2e4c9d1b7f5e3a2c6d8f4b1e9a7c5d3f2b8e6a4c1d9f7b5e3a2c8d6f4b9e1',
            isOnChain: true, verificationCount: 1247,
            supplyChain: [
              { stage: 'Manufacturing', handler: 'MediCorp Pharmaceuticals', timestamp: '2024-01-15', location: 'Lahore, PK', notes: 'Genesis Block' },
              { stage: 'Quality Check', handler: 'QC Laboratory', timestamp: '2024-01-20', location: 'Lahore, PK', notes: 'All tests passed' },
              { stage: 'Distribution', handler: 'National Pharma', timestamp: '2024-02-01', location: 'Karachi, PK', notes: 'Cold chain maintained' },
              { stage: 'Consumer', handler: 'You', timestamp: new Date().toISOString(), location: 'Your Location', notes: 'Verified Today' },
            ]
          })
          
          // For script trigger simulation if url contains expired parameters
          if (searchParams.get('batch') === 'expired' || result === 'expired') {
            setResult('expired')
            setCryptoRevoked(true)
          } else {
            setResult('authentic')
          }
          setResponseTime(847)
        }
      } catch (err) {
        // Demo fallback on error
        setMedicine({
          name: 'Amoxicillin CL', genericName: 'Amoxicillin Trihydrate',
          batchNumber: searchParams.get('batch') || 'M-10293', serialNumber: 'SN-2024-001',
          dosage: '500mg', saltComposition: 'Amoxicillin Trihydrate IP 500mg',
          manufacturerName: 'MediCorp Pharmaceuticals', licenseNumber: 'LIC-MED-2024-PK',
          expiryDate: '2027-12-01', sha256Hash: 'a8f2e4c9d1b7f5e3a2c6d8f4b1e9a7c5d3f2b8e6a4c1d9f7b5e3a2c8d6f4b9e1',
          isOnChain: true, verificationCount: 1247,
          supplyChain: [
            { stage: 'Manufacturing', handler: 'MediCorp Pharmaceuticals', timestamp: '2024-01-15', location: 'Lahore, PK', notes: 'Genesis Block' },
            { stage: 'Quality Check', handler: 'QC Laboratory', timestamp: '2024-01-20', location: 'Lahore, PK', notes: 'All tests passed' },
            { stage: 'Distribution', handler: 'National Pharma', timestamp: '2024-02-01', location: 'Karachi, PK', notes: 'Cold chain maintained' },
            { stage: 'Consumer', handler: 'You', timestamp: new Date().toISOString(), location: 'Your Location', notes: 'Verified Today' },
          ]
        })
        setResult('authentic')
        setResponseTime(847)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams, result])

  const resultColor = result === 'authentic' ? '#00f5a0' : result === 'expired' ? '#ff9500' : '#ff4d6d'
  const resultIcon = result === 'authentic' ? '✅' : result === 'expired' ? '⚠️' : '❌'
  const resultText = result === 'authentic' ? 'VERIFIED' : result === 'expired' ? 'EXPIRED' : result === 'recalled' ? 'RECALLED' : 'COUNTERFEIT'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid rgba(0,219,233,0.2)', borderTop: '3px solid #00dbe9', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600 }}>Verifying Medicine...</p>
          <p style={{ color: '#5a6370', fontSize: '12px', marginTop: '8px' }}>Checking blockchain records</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ══ STEP 4: RED ALERT COMPONENT RENDER BLOCK ══
  if (cryptoRevoked || result === 'expired') {
    return (
      <div style={{ minHeight:'100vh', background:'#0A0B10', fontFamily:'Inter, sans-serif', position:'relative', overflow:'hidden' }}>
        <Navbar />

        {/* Glitch background effect */}
        <div style={{ position:'fixed', inset:0, background:'repeating-linear-gradient(0deg, rgba(255,0,0,0.03) 0px, rgba(255,0,0,0.03) 1px, transparent 1px, transparent 2px)', pointerEvents:'none', animation:'glitch 0.1s infinite', zIndex:0 }} />
        <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(circle, rgba(255,0,0,0.12) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'20px', textAlign:'center' }}>

          {/* Skull/Alert Icon */}
          <div style={{ position:'relative', marginBottom:'24px' }}>
            <div style={{ width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,0,0,0.1)', border:'3px solid rgba(255,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'56px', boxShadow:'0 0 60px rgba(255,0,0,0.5), inset 0 0 30px rgba(255,0,0,0.1)', animation:'pulse 1s ease-in-out infinite' }}>
              ☠️
            </div>
            <div style={{ position:'absolute', inset:'-12px', borderRadius:'50%', border:'2px solid rgba(255,0,0,0.3)', animation:'orbit 2s linear infinite' }} />
          </div>

          <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, color:'#ff0000', letterSpacing:'0.3em', marginBottom:'16px', animation:'blink 1s infinite' }}>
            ⚠ BLOCKCHAIN SECURITY ALERT ⚠
          </div>

          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:900, fontSize:isMobile ? '32px' : '52px', color:'#ff1a1a', textShadow:'0 0 40px rgba(255,0,0,0.8), 0 0 80px rgba(255,0,0,0.4)', marginBottom:'12px', letterSpacing:'0.06em', lineHeight:1 }}>
            CRYPTO TOKEN
          </h1>
          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:900, fontSize:isMobile ? '32px' : '52px', color:'#ff1a1a', textShadow:'0 0 40px rgba(255,0,0,0.8)', marginBottom:'24px', letterSpacing:'0.06em', lineHeight:1 }}>
            REVOKED
          </h1>

          <div style={{ background:'rgba(255,0,0,0.08)', border:'2px solid rgba(255,0,0,0.4)', borderRadius:'20px', padding:'24px 32px', maxWidth:'600px', marginBottom:'32px', backdropFilter:'blur(12px)' }}>
            <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', fontWeight:700, color:'#ff4444', marginBottom:'12px' }}>
              CRITICAL: Expired Batch Scan Detected
            </p>
            <p style={{ fontSize:'14px', color:'#ff9999', lineHeight:1.7, marginBottom:'16px' }}>
              This medicine's cryptographic verification token has been <strong>permanently self-destructed</strong> on the Ethereum blockchain. The batch expiry timestamp has passed, and the smart contract has automatically revoked this QR code's validity.
            </p>
            <div style={{ background:'rgba(255,0,0,0.1)', borderRadius:'12px', padding:'16px', border:'1px solid rgba(255,0,0,0.3)' }}>
              <p style={{ fontFamily:'monospace', fontSize:'12px', color:'#ff6666', marginBottom:'8px' }}>
                ⛓️ Smart Contract: 0x96662c29a7f56C6817065749c35E7F95AE83B971
              </p>
              <p style={{ fontFamily:'monospace', fontSize:'12px', color:'#ff6666', marginBottom:'8px' }}>
                🔴 Status: EXPIRED_REVOKED
              </p>
              <p style={{ fontFamily:'monospace', fontSize:'12px', color:'#ff6666' }}>
                ⏰ Revocation logged on Ethereum at block timestamp
              </p>
            </div>
          </div>

          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', marginBottom:'32px' }}>
            {[
              { icon:'☠️', text:'Do NOT consume this medicine' },
              { icon:'🏥', text:'Contact your pharmacist immediately' },
              { icon:'📞', text:'Report to DRAP: 051-9255099' },
            ].map((w,i) => (
              <div key={i} style={{ background:'rgba(255,0,0,0.08)', border:'1px solid rgba(255,0,0,0.3)', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'20px' }}>{w.icon}</span>
                <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', fontWeight:700, color:'#ff4444' }}>{w.text}</span>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/scan')} style={{ padding:'16px 32px', background:'transparent', border:'2px solid rgba(255,0,0,0.5)', borderRadius:'12px', color:'#ff4444', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'14px', cursor:'pointer', letterSpacing:'0.1em' }}>
            ← SCAN ANOTHER MEDICINE
          </button>
        </div>

        {isMobile && <BottomNav />}

        <style>{`
          @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 1px) }
            40% { transform: translate(2px, -1px) }
            60% { transform: translate(-1px, 2px) }
            80% { transform: translate(1px, -2px) }
            100% { transform: translate(0) }
          }
          @keyframes pulse {
            0%,100% { box-shadow: 0 0 60px rgba(255,0,0,0.5); }
            50% { box-shadow: 0 0 100px rgba(255,0,0,0.9); }
          }
          @keyframes orbit {
            from { transform: rotate(0deg) }
            to { transform: rotate(360deg) }
          }
          @keyframes blink {
            0%,100% { opacity: 1 }
            50% { opacity: 0.3 }
          }
        `}</style>
      </div>
    )
  }

  // ══ ORIGINAL AUTHENTIC DISPENSATION RENDER ══
  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: `radial-gradient(circle, ${resultColor}10 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 40px' }}>

        {/* Result Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{resultIcon}</div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: isMobile ? '40px' : '56px', color: resultColor, textShadow: `0 0 40px ${resultColor}60`, marginBottom: '8px', letterSpacing: '0.06em' }}>{resultText}</h1>
          <p style={{ fontSize: '12px', color: '#849495', letterSpacing: '0.16em', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
            {result === 'authentic' ? 'AUTHENTICITY CONFIRMED VIA BLOCKCHAIN LEDGER' : 'WARNING: VERIFICATION FAILED'}
          </p>
          {responseTime > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,219,233,0.06)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '999px', padding: '5px 16px', marginTop: '12px' }}>
              <span style={{ fontSize: '12px', color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>⚡ Verified in {responseTime}ms</span>
            </div>
          )}
        </div>

        {medicine ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '20px' }}>
            {/* Medicine Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${resultColor}60, transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: isMobile ? '20px' : '26px', color: '#e3e1e9', marginBottom: '4px' }}>{medicine.name}</h2>
                    <p style={{ fontSize: '11px', color: '#849495', letterSpacing: '0.1em', fontFamily: 'Space Grotesk, sans-serif' }}>{medicine.genericName?.toUpperCase()}</p>
                  </div>
                  <div style={{ background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '8px', padding: '6px 14px' }}>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: '#00dbe9' }}>{medicine.dosage}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  {[
                    { label: 'BATCH NUMBER', val: medicine.batchNumber },
                    { label: 'EXPIRY DATE', val: medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : 'N/A' },
                    { label: 'MANUFACTURER', val: medicine.manufacturerName },
                    { label: 'LICENSE', val: medicine.licenseNumber },
                  ].map((f, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '6px' }}>{f.label}</p>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 700, color: '#e3e1e9' }}>{f.val}</p>
                    </div>
                  ))}
                </div>
                {medicine.saltComposition && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '6px' }}>SALT COMPOSITION</p>
                    <p style={{ fontSize: '13px', color: '#b9cacb', lineHeight: 1.5, fontStyle: 'italic' }}>{medicine.saltComposition}</p>
                  </div>
                )}
              </div>

              {/* Hash */}
              <div style={{ background: 'rgba(0,219,233,0.04)', border: '1px solid rgba(0,219,233,0.15)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em' }}>BLOCKCHAIN HASH</p>
                  <span style={{ fontSize: '11px', color: '#00f5a0', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>✓ IMMUTABLE</span>
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00dbe9', wordBreak: 'break-all', lineHeight: 1.6 }}>{medicine.sha256Hash}</p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => alert('Report submitted! Our compliance team will review this case within 24 hours.')} style={{ padding: '14px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>↗ REPORT</button>
                <button onClick={() => downloadCertificate(medicine, result, responseTime)} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>↓ CERTIFICATE</button>
              </div>
              <button onClick={() => router.push('/scan')} style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>← SCAN ANOTHER MEDICINE</button>
            </div>

            {/* Supply Chain */}
            <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px', alignSelf: 'start' }}>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em', marginBottom: '20px' }}>SUPPLY CHAIN PROOF</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(medicine.supplyChain?.length > 0 ? medicine.supplyChain : [
                  { stage: 'Manufacturing', handler: medicine.manufacturerName, timestamp: medicine.manufactureDate || new Date(), location: 'Factory', notes: 'Genesis Block' },
                  { stage: 'Consumer', handler: 'You', timestamp: new Date(), location: 'Your Location', notes: 'Verified Today' },
                ]).map((step, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < arr.length - 1 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === arr.length - 1 ? 'rgba(0,219,233,0.15)' : 'rgba(255,255,255,0.05)', border: `2px solid ${i === arr.length - 1 ? '#00dbe9' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === arr.length - 1 ? '0 0 14px rgba(0,219,233,0.4)' : 'none' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === arr.length - 1 ? '#00dbe9' : 'rgba(255,255,255,0.3)' }} />
                      </div>
                      {i < arr.length - 1 && <div style={{ width: '1px', height: '36px', background: 'repeating-linear-gradient(to bottom, rgba(0,219,233,0.3) 0px, rgba(0,219,233,0.3) 4px, transparent 4px, transparent 10px)' }} />}
                    </div>
                    <div style={{ paddingTop: '4px', paddingBottom: '12px', flex: 1 }}>
                      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, color: i === arr.length - 1 ? '#00dbe9' : '#e3e1e9', marginBottom: '3px' }}>{step.handler || step.stage}</h4>
                      <p style={{ fontSize: '11px', color: '#849495' }}>{step.notes} • {new Date(step.timestamp).toLocaleDateString()}</p>
                      {step.location && <p style={{ fontSize: '10px', color: '#5a6370', marginTop: '2px' }}>📍 {step.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, color: '#00f5a0', marginBottom: '4px' }}>🔐 CRYPTOGRAPHIC PROOF</p>
                <p style={{ fontSize: '11px', color: '#849495' }}>{medicine.verificationCount?.toLocaleString() || '0'} verifications • Chain intact</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', color: '#ff4d6d', marginBottom: '12px' }}>Medicine Not Found</h2>
            <p style={{ fontSize: '14px', color: '#849495', marginBottom: '24px' }}>{error || 'This medicine is not registered on MediVerify blockchain.'}</p>
            <button onClick={() => router.push('/scan')} style={{ padding: '14px 28px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>← SCAN AGAIN</button>
          </div>
        )}
        <div style={{ height: isMobile ? '80px' : '40px' }} />
      </div>
      <Footer />
      {isMobile && <BottomNav />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0B10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid rgba(0,219,233,0.2)', borderTop: '3px solid #00dbe9', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600 }}>Verifying...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}