'use client'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { verifyOfflineSignature, isOnline } from '../../lib/offlineVerify'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const QrScanner = dynamic(() => import('./QrScanner'), { ssr: false })

export default function ScanPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(true)
  const [scanY, setScanY] = useState(10)
  const [showManual, setShowManual] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [flashOn, setFlashOn] = useState(false)
  const [scanStatus, setScanStatus] = useState('active')
  const [scanProgress, setScanProgress] = useState(0)
  const [cameraMode, setCameraMode] = useState(false)
  const fileInputRef = useRef(null)
  const fileInputRefDesktop = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let dir = 1, pos = 10
    const si = setInterval(() => {
      pos += dir * 1.2
      if (pos >= 88) dir = -1
      if (pos <= 10) dir = 1
      setScanY(pos)
    }, 20)
    return () => clearInterval(si)
  }, [])

  const handleSimulateScan = () => {
    if (scanStatus !== 'active') return
    setScanStatus('scanning')
    setScanProgress(0)
    const pi = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(pi)
          setScanStatus('found')
          setTimeout(() => router.push('/result?batch=M-10293'), 800)
          return 100
        }
        return p + 3
      })
    }, 40)
  }

  const handleRealScan = async (scannedText) => {
    setScanStatus('scanning')
    setScanProgress(0)
    setCameraMode(false)

    let parsed = null
    try {
      parsed = JSON.parse(scannedText)
    } catch {
      const pi = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(pi)
            setScanStatus('found')
            setTimeout(() => router.push(`/result?batch=${scannedText}`), 600)
            return 100
          }
          return p + 5
        })
      }, 30)
      return
    }

    if (!isOnline() && parsed.sig) {
      const verification = await verifyOfflineSignature(parsed)
      sessionStorage.setItem('offlineVerification', JSON.stringify(verification))
      const pi = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(pi)
            setScanStatus('found')
            setTimeout(() => {
  const data = sessionStorage.getItem('offlineVerification')
  if (data) {
    router.push('/result?mode=offline')
  } else {
    router.push('/result?batch=M-10293')
  }
}, 600)
            return 100
          }
          return p + 8
        })
      }, 25)
      return
    }

    let searchParam = ''
    if (parsed.hash) searchParam = `hash=${parsed.hash}`
    else if (parsed.batch) searchParam = `batch=${parsed.batch}`
    else searchParam = `serial=${parsed.serial}`

    const pi = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(pi)
          setScanStatus('found')
          setTimeout(() => router.push(`/result?${searchParam}`), 600)
          return 100
        }
        return p + 5
      })
    }, 30)
  }

  // ══ Image Upload QR Scanner ══
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setScanStatus('scanning')
    setScanProgress(20)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('qr-reader-hidden')
      const result = await html5QrCode.scanFile(file, true)
      setScanProgress(80)
      await html5QrCode.clear()
      setScanProgress(100)
      setScanStatus('found')
      setTimeout(() => handleRealScan(result), 400)
    } catch (err) {
      console.error('QR scan error:', err)
      setScanStatus('active')
      setScanProgress(0)
      alert('Could not read QR code from image. Please try a clearer image.')
    }
    e.target.value = ''
  }

  const handleVerify = () => {
    if (!manualCode.trim()) return
    setScanStatus('scanning')
    setScanProgress(0)
    const pi = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(pi)
          setScanStatus('found')
          setTimeout(() => router.push(`/result?batch=${manualCode.trim()}`), 600)
          return 100
        }
        return p + 4
      })
    }, 35)
  }

  const StaticViewfinder = ({ height }) => (
    <div style={{ position: 'relative', width: '100%', height: height || '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #060810 0%, #0a1520 50%, #060d18 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,219,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,219,233,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '65%', height: '65%', borderRadius: '50%', overflow: 'hidden', opacity: 0.75, boxShadow: '0 0 50px rgba(0,219,233,0.2)' }}>
        <Image src="/medicine-capsule.png" alt="Medicine" fill style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
      {[
        { top: '12px', left: '12px', borderTop: '2.5px solid #00dbe9', borderLeft: '2.5px solid #00dbe9' },
        { top: '12px', right: '12px', borderTop: '2.5px solid #00dbe9', borderRight: '2.5px solid #00dbe9' },
        { bottom: '12px', left: '12px', borderBottom: '2.5px solid #00dbe9', borderLeft: '2.5px solid #00dbe9' },
        { bottom: '12px', right: '12px', borderBottom: '2.5px solid #00dbe9', borderRight: '2.5px solid #00dbe9' },
      ].map((s, i) => <div key={i} style={{ position: 'absolute', width: '32px', height: '32px', ...s }} />)}
      {scanStatus !== 'found' && (
        <div style={{ position: 'absolute', left: '12px', right: '12px', height: '2px', background: 'linear-gradient(90deg, transparent, #00dbe9, #00f0ff, #00dbe9, transparent)', boxShadow: '0 0 12px rgba(0,219,233,0.9)', top: `${scanY}%`, transition: 'top 0.02s linear', zIndex: 5 }} />
      )}
      {scanStatus === 'found' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,245,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px' }}>✅</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#00f5a0', marginTop: '8px' }}>QR Code Found!</div>
          </div>
        </div>
      )}
      {scanStatus === 'scanning' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
          <div style={{ height: '100%', width: `${scanProgress}%`, background: 'linear-gradient(90deg, #00dbe9, #00f0ff)', boxShadow: '0 0 8px rgba(0,219,233,0.8)', transition: 'width 0.04s linear' }} />
        </div>
      )}
      <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,11,16,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,219,233,0.2)', borderRadius: '999px', padding: '5px 14px', whiteSpace: 'nowrap', zIndex: 8 }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 600, color: '#00dbe9', letterSpacing: '0.1em' }}>
          {scanStatus === 'scanning' ? `Verifying... ${scanProgress}%` : scanStatus === 'found' ? '✓ Found!' : '● Scanner Active'}
        </span>
      </div>
    </div>
  )

  // ══════════ MOBILE ══════════
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B10', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
        {/* Hidden div for QR scanning */}
        <div id="qr-reader-hidden" style={{ display: 'none' }} />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />

        <Navbar />

        <div style={{ padding: '16px 20px 8px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>SCANNING SYSTEM ACTIVE</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#e3e1e9' }}>Scanner Portal</h1>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <button onClick={() => setFlashOn(!flashOn)} style={{ width: '46px', height: '46px', borderRadius: '50%', background: flashOn ? 'rgba(0,219,233,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${flashOn ? 'rgba(0,219,233,0.5)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}>🔦</button>
          <button onClick={() => setShowManual(!showManual)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: showManual ? 'rgba(0,219,233,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showManual ? 'rgba(0,219,233,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', padding: '11px 20px', color: showManual ? '#00dbe9' : '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✏️ Manual Entry</button>
        </div>

        <div style={{ flex: 1, padding: '0 20px', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          {cameraMode ? (
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
              <QrScanner onScanSuccess={handleRealScan} onScanError={() => {}} />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '14px' }}>
              <StaticViewfinder />
            </div>
          )}

          {/* ── 3 Scan Buttons ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {/* Open Camera */}
            <button onClick={() => setCameraMode(!cameraMode)} style={{ width: '100%', padding: '13px', background: cameraMode ? 'rgba(255,77,109,0.08)' : 'rgba(0,219,233,0.08)', border: `1px solid ${cameraMode ? 'rgba(255,77,109,0.3)' : 'rgba(0,219,233,0.3)'}`, borderRadius: '12px', color: cameraMode ? '#ff4d6d' : '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {cameraMode ? '✕ Close Camera' : '📷 Open Camera — Scan QR Code'}
            </button>

            {/* Upload Image */}
            <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '13px', background: 'rgba(197,196,222,0.06)', border: '1px solid rgba(197,196,222,0.25)', borderRadius: '12px', color: '#c5c4de', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              🖼️ Upload QR Image
            </button>
          </div>

          {/* Manual entry */}
          {showManual && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '16px', padding: '18px', marginBottom: '12px' }}>
              <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em', display: 'block', marginBottom: '10px' }}>ENTER BATCH CODE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="e.g. M-10293" value={manualCode} onChange={e => setManualCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,219,233,0.3)', borderRadius: '10px', padding: '11px 14px', color: '#e3e1e9', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none' }} />
                <button onClick={handleVerify} style={{ padding: '11px 18px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>VERIFY</button>
              </div>
            </div>
          )}

          {/* Status card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 10px rgba(0,219,233,0.9)', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: '#e3e1e9', marginBottom: '3px' }}>Scanning System Active</h3>
              <p style={{ fontSize: '11px', color: '#849495' }}>Align QR code within the frame or upload image</p>
            </div>
          </div>

          {/* Format pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[{ icon: '🔍', text: 'QR Code' }, { icon: '▦', text: 'Barcode' }, { icon: '🖼️', text: 'Image Upload' }, { icon: '📝', text: 'Batch ID' }].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '5px 12px' }}>
                <span style={{ fontSize: '11px' }}>{p.icon}</span>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 600, color: '#849495' }}>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Demo button */}
          <button onClick={handleSimulateScan} disabled={scanStatus !== 'active'} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '12px', color: scanStatus !== 'active' ? '#5a6370' : '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', cursor: scanStatus !== 'active' ? 'not-allowed' : 'pointer', marginBottom: '20px' }}>
            {scanStatus === 'active' ? '▶ DEMO — Simulate QR Scan' : scanStatus === 'scanning' ? `⏳ Verifying... ${scanProgress}%` : '✓ Redirecting...'}
          </button>
        </div>

        <Footer />
        <BottomNav />
        <style>{`@keyframes pulseDot{0%,100%{transform:scale(1);box-shadow:0 0 8px rgba(0,219,233,.8)}50%{transform:scale(1.5);box-shadow:0 0 20px rgba(0,219,233,1)}}`}</style>
      </div>
    )
  }

  // ══════════ DESKTOP ══════════
  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <div id="qr-reader-hidden" style={{ display: 'none' }} />
      <input ref={fileInputRefDesktop} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,219,233,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', padding: '40px 80px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>

        {/* LEFT — Viewfinder */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 8px #00dbe9' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.14em' }}>LIVE SCANNER — BLOCKCHAIN READY</span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#e3e1e9', marginBottom: '6px' }}>Medicine Scanner Portal</h1>
            <p style={{ fontSize: '14px', color: '#849495' }}>Align QR code within the frame, upload an image, or enter batch number manually</p>
          </div>

          {/* ── Camera + Image buttons ── */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setCameraMode(!cameraMode)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: cameraMode ? 'rgba(255,77,109,0.08)' : 'rgba(0,219,233,0.08)', border: `1px solid ${cameraMode ? 'rgba(255,77,109,0.3)' : 'rgba(0,219,233,0.3)'}`, borderRadius: '12px', padding: '12px 20px', color: cameraMode ? '#ff4d6d' : '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}>
              {cameraMode ? '✕ Close Camera' : '📷 Open Camera'}
            </button>
            <button onClick={() => fileInputRefDesktop.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(197,196,222,0.06)', border: '1px solid rgba(197,196,222,0.25)', borderRadius: '12px', padding: '12px 20px', color: '#c5c4de', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}>
              🖼️ Upload QR Image
            </button>
            <button onClick={() => setShowManual(!showManual)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: showManual ? 'rgba(0,219,233,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showManual ? 'rgba(0,219,233,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '12px 20px', color: showManual ? '#00dbe9' : '#849495', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}>
              ✏️ Manual Entry
            </button>
          </div>

          {/* Viewfinder */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '65%', borderRadius: '20px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {cameraMode ? (
                <QrScanner onScanSuccess={handleRealScan} onScanError={() => {}} />
              ) : (
                <StaticViewfinder height="100%" />
              )}
            </div>
          </div>

          {/* Manual entry */}
          {showManual && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#00dbe9', letterSpacing: '0.12em', display: 'block', marginBottom: '12px' }}>ENTER BATCH CODE</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="e.g. M-10293" value={manualCode} onChange={e => setManualCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,219,233,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#e3e1e9', fontFamily: 'Inter, sans-serif', fontSize: '13px', outline: 'none' }} />
                <button onClick={handleVerify} style={{ padding: '12px 24px', background: '#00dbe9', color: '#001214', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 16px rgba(0,219,233,0.35)' }}>VERIFY</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.4), transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,219,233,0.08)', border: '1px solid rgba(0,219,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 12px rgba(0,219,233,1)', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: '#e3e1e9', marginBottom: '3px' }}>Scanner Ready</h3>
                <p style={{ fontSize: '12px', color: '#849495' }}>Blockchain node connected</p>
              </div>
            </div>
            {[{ label: 'Network', val: 'Ethereum Mainnet', color: '#00dbe9' }, { label: 'Node Status', val: '● Active', color: '#00f5a0' }, { label: 'Avg Response', val: '0.8s', color: '#c5c4de' }].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{r.label}</span>
                <span style={{ fontSize: '12px', color: r.color, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Formats */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(16px)' }}>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '10px', fontWeight: 700, color: '#849495', letterSpacing: '0.12em', marginBottom: '12px' }}>SUPPORTED FORMATS</p>
            {[{ icon: '🔍', text: 'QR Code', sub: 'Standard & Micro QR' }, { icon: '▦', text: 'Barcode', sub: 'Code 128, EAN-13' }, { icon: '🖼️', text: 'Image Upload', sub: 'JPG, PNG, WebP' }, { icon: '📝', text: 'Manual Entry', sub: 'Batch ID format' }].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 600, color: '#e3e1e9' }}>{f.text}</div>
                  <div style={{ fontSize: '11px', color: '#5a6370' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo button */}
          <button onClick={handleSimulateScan} disabled={scanStatus !== 'active'} style={{ width: '100%', padding: '16px', background: scanStatus === 'active' ? 'rgba(0,219,233,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${scanStatus === 'active' ? 'rgba(0,219,233,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', color: scanStatus !== 'active' ? '#5a6370' : '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', cursor: scanStatus !== 'active' ? 'not-allowed' : 'pointer' }}>
            {scanStatus === 'active' ? '▶ DEMO — Simulate QR Scan' : scanStatus === 'scanning' ? `⏳ Verifying... ${scanProgress}%` : '✓ Redirecting...'}
          </button>

          {/* Offline badge */}
          <div style={{ background: 'rgba(0,219,233,0.04)', border: '1px solid rgba(0,219,233,0.12)', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📡</span>
            <div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#00dbe9', marginBottom: '3px' }}>Offline-First Enabled</p>
              <p style={{ fontSize: '11px', color: '#849495', lineHeight: 1.5 }}>Cryptographic verification works even without internet.</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulseDot{0%,100%{transform:scale(1);box-shadow:0 0 8px rgba(0,219,233,.8)}50%{transform:scale(1.5);box-shadow:0 0 20px rgba(0,219,233,1)}}`}</style>
    </div>
  )
}