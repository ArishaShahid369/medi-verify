'use client'
import { useEffect, useRef, useState } from 'react'

export default function QrScanner({ onScanSuccess, onScanError }) {
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState(null)
  const scannerInstance = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader-container')
      scannerInstance.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop()
          setIsStarted(false)
          onScanSuccess(decodedText)
        },
        () => {}
      )
      setIsStarted(true)
      setError(null)
    } catch (err) {
      setError('Camera access denied. Please allow camera permission in browser settings.')
      if (onScanError) onScanError(err)
    }
  }

  const stopScanner = async () => {
    if (scannerInstance.current) {
      await scannerInstance.current.stop().catch(() => {})
      setIsStarted(false)
    }
  }

  const scanFromFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-file-reader')
      const result = await scanner.scanFile(file, true)
      onScanSuccess(result)
    } catch (err) {
      setError('Could not read QR code from image. Try another image.')
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden div for file scanning */}
      <div id="qr-file-reader" style={{ display: 'none' }} />

      {/* Camera feed area */}
      <div style={{ flex: 1, position: 'relative', background: '#060810', borderRadius: '12px', overflow: 'hidden', minHeight: '300px' }}>

        {/* Camera container */}
        <div id="qr-reader-container" style={{ width: '100%', height: '100%', position: isStarted ? 'relative' : 'absolute' }} />

        {/* Placeholder when camera off */}
        {!isStarted && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'linear-gradient(135deg, #060810, #0a1520)' }}>
            {/* Grid background */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,219,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,219,233,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            {/* Corner brackets */}
            {[
              { top: '20px', left: '20px', borderTop: '2px solid rgba(0,219,233,0.4)', borderLeft: '2px solid rgba(0,219,233,0.4)' },
              { top: '20px', right: '20px', borderTop: '2px solid rgba(0,219,233,0.4)', borderRight: '2px solid rgba(0,219,233,0.4)' },
              { bottom: '20px', left: '20px', borderBottom: '2px solid rgba(0,219,233,0.4)', borderLeft: '2px solid rgba(0,219,233,0.4)' },
              { bottom: '20px', right: '20px', borderBottom: '2px solid rgba(0,219,233,0.4)', borderRight: '2px solid rgba(0,219,233,0.4)' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s }} />)}

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px', opacity: 0.6 }}>📷</div>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', color: '#849495', marginBottom: '4px' }}>Camera is Off</p>
              <p style={{ fontSize: '12px', color: '#5a6370' }}>Click below to start scanning</p>
            </div>

            {error && (
              <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '10px', padding: '10px 16px', maxWidth: '280px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#ff4d6d' }}>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        {/* Camera toggle */}
        <button onClick={isStarted ? stopScanner : startScanner} style={{ flex: 1, padding: '13px', background: isStarted ? 'rgba(255,77,109,0.1)' : 'rgba(0,219,233,0.1)', border: `1px solid ${isStarted ? 'rgba(255,77,109,0.3)' : 'rgba(0,219,233,0.3)'}`, borderRadius: '12px', color: isStarted ? '#ff4d6d' : '#00dbe9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {isStarted ? '⏹ STOP CAMERA' : '▶ START CAMERA'}
        </button>

        {/* Scan from image */}
        <label style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
          🖼️ SCAN FROM IMAGE
          <input type="file" accept="image/*" onChange={scanFromFile} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  )
}