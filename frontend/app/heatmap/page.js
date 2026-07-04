'use client'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./HeatmapMap'), { ssr: false })

export default function HeatmapPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetch(`${API_URL}/verify/heatmap`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredPoints = data?.points?.filter(p =>
    filter === 'all' ? true : p.result === filter
  ) || []

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B10', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ padding: '28px 24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff4d6d', boxShadow: '0 0 8px #ff4d6d', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#ff4d6d', letterSpacing: '0.14em' }}>LIVE THREAT INTELLIGENCE</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: '#e3e1e9', marginBottom: '6px' }}>Fake Medicine Heatmap</h1>
          <p style={{ fontSize: '13px', color: '#849495' }}>Real-time crowd-sourced counterfeit medicine detection across Pakistan — powered by MediVerify AI</p>
        </div>

        {/* Stats Row */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Threats', val: data.total, color: '#00dbe9', icon: '📍' },
              { label: 'Counterfeit', val: data.counterfeit, color: '#ff4d6d', icon: '❌' },
              { label: 'Recalled', val: data.recalled, color: '#ff9500', icon: '⚠️' },
              { label: 'Expired', val: data.expired, color: '#c5c4de', icon: '⏰' },
            ].map((s, i) => (
              <div key={i} style={{ background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '28px', color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#849495', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { val: 'all', label: '🗺️ All Threats', color: '#00dbe9' },
            { val: 'counterfeit', label: '❌ Counterfeit', color: '#ff4d6d' },
            { val: 'recalled', label: '⚠️ Recalled', color: '#ff9500' },
            { val: 'expired', label: '⏰ Expired', color: '#c5c4de' },
          ].map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)} style={{ padding: '8px 18px', background: filter === f.val ? `${f.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === f.val ? f.color : 'rgba(255,255,255,0.1)'}`, borderRadius: '999px', color: filter === f.val ? f.color : '#849495', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: '500px', position: 'relative' }}>
          {loading ? (
            <div style={{ height: '100%', background: '#0d0e13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,77,109,0.2)', borderTop: '3px solid #ff4d6d', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#ff4d6d', fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' }}>Loading threat intelligence...</p>
              </div>
            </div>
          ) : (
            <Map points={filteredPoints} />
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[
            { color: '#ff4d6d', label: 'Counterfeit Detected' },
            { color: '#ff9500', label: 'Recalled Batch' },
            { color: '#c5c4de', label: 'Expired Medicine' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
              <span style={{ fontSize: '12px', color: '#849495', fontFamily: 'Space Grotesk, sans-serif' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Alert Banner */}
        <div style={{ marginTop: '20px', background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '24px' }}>🚨</span>
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 700, color: '#ff4d6d', marginBottom: '4px' }}>DRAP Alert Integration Ready</p>
            <p style={{ fontSize: '12px', color: '#849495', lineHeight: 1.5 }}>This real-time heatmap data can be shared with Drug Regulatory Authority of Pakistan (DRAP) to identify counterfeit medicine hotspots and deploy enforcement teams to the most affected areas.</p>
          </div>
        </div>
        <div style={{ height: '80px' }} />
      </div>

      <Footer />
      <BottomNav />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  )
}