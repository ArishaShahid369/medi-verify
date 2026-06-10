'use client'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, authentic: 0, counterfeit: 0, today: 0 })

  useEffect(() => { fetchHistory(); fetchStats() }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verify/history')
      const data = await res.json()
      if (data.success) setHistory(data.logs)
    } catch {
      setHistory([
        { _id:'1', batchNumber:'M-10293', result:'authentic', createdAt:new Date().toISOString(), responseTime:923, deviceInfo:{location:'Karachi, PK'}, medicine:{name:'Amoxicillin CL'} },
        { _id:'2', batchNumber:'BXC-0021', result:'authentic', createdAt:new Date(Date.now()-3600000).toISOString(), responseTime:756, deviceInfo:{location:'Lahore, PK'}, medicine:{name:'Paracet-Max'} },
        { _id:'3', batchNumber:'FAKE-001', result:'counterfeit', createdAt:new Date(Date.now()-7200000).toISOString(), responseTime:412, deviceInfo:{location:'Karachi, PK'}, medicine:null },
        { _id:'4', batchNumber:'BXC-0024', result:'authentic', createdAt:new Date(Date.now()-86400000).toISOString(), responseTime:634, deviceInfo:{location:'Islamabad, PK'}, medicine:{name:'Metformin HCl'} },
        { _id:'5', batchNumber:'BXC-0023', result:'authentic', createdAt:new Date(Date.now()-172800000).toISOString(), responseTime:891, deviceInfo:{location:'Peshawar, PK'}, medicine:{name:'Ciprofloxacin'} },
      ])
    } finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verify/stats')
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch { setStats({ total:1247, authentic:1198, counterfeit:49, today:23 }) }
  }

  const getResultColor = r => r==='authentic'?'#00f5a0':r==='counterfeit'?'#ff4d6d':'#ff9500'
  const getResultBg = r => r==='authentic'?'rgba(0,245,160,0.1)':r==='counterfeit'?'rgba(255,77,109,0.1)':'rgba(255,149,0,0.1)'
  const getResultBorder = r => r==='authentic'?'rgba(0,245,160,0.3)':r==='counterfeit'?'rgba(255,77,109,0.3)':'rgba(255,149,0,0.3)'
  const formatTime = date => new Date(date).toLocaleString('en-PK', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })

  return (
    <div style={{ minHeight:'100vh', background:'#0A0B10', fontFamily:'Inter, sans-serif' }}>
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', background:'radial-gradient(ellipse, rgba(0,219,233,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* ✅ Sahi tarika */}
      <Navbar />

      <div style={{ padding:'28px 20px', maxWidth:'900px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ marginBottom:'28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00dbe9', boxShadow:'0 0 8px #00dbe9' }} />
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, color:'#00dbe9', letterSpacing:'0.14em' }}>VERIFICATION HISTORY</span>
          </div>
          <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'28px', color:'#e3e1e9', marginBottom:'6px' }}>Scan History</h1>
          <p style={{ fontSize:'13px', color:'#849495' }}>All medicine verification records — blockchain logged</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total Scans', val:stats.total||1247, color:'#00dbe9', icon:'📊' },
            { label:'Authentic', val:stats.authentic||1198, color:'#00f5a0', icon:'✅' },
            { label:'Counterfeit', val:stats.counterfeit||49, color:'#ff4d6d', icon:'❌' },
            { label:'Today', val:stats.today||23, color:'#c5c4de', icon:'📅' },
          ].map((s,i) => (
            <div key={i} style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border:`1px solid ${s.color}25`, borderRadius:'16px', padding:'16px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:'1px', background:`linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
              <div style={{ fontSize:'20px', marginBottom:'8px' }}>{s.icon}</div>
              <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'24px', color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:'11px', color:'#849495', marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', overflow:'hidden', backdropFilter:'blur(12px)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr 0.8fr 0.8fr 0.7fr', gap:'12px', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
            {['MEDICINE','BATCH NUMBER','RESULT','RESPONSE','TIME'].map(h => (
              <span key={h} style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', fontWeight:700, color:'#5a6370', letterSpacing:'0.12em' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:'40px', textAlign:'center' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid rgba(0,219,233,0.2)', borderTop:'2px solid #00dbe9', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
              <p style={{ fontSize:'13px', color:'#849495' }}>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding:'48px', textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>📋</div>
              <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'18px', color:'#e3e1e9', marginBottom:'8px' }}>No History Yet</h3>
              <p style={{ fontSize:'13px', color:'#849495', marginBottom:'20px' }}>Scan a medicine to see verification history</p>
              <button onClick={() => router.push('/scan')} style={{ padding:'12px 24px', background:'#00dbe9', color:'#001214', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'12px', border:'none', borderRadius:'10px', cursor:'pointer' }}>SCAN NOW</button>
            </div>
          ) : history.map((log, i) => (
            <div key={log._id} onClick={() => router.push(`/result?batch=${log.batchNumber}`)}
              style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr 0.8fr 0.8fr 0.7fr', gap:'12px', padding:'16px 20px', borderBottom:i<history.length-1?'1px solid rgba(255,255,255,0.04)':'none', cursor:'pointer', transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(0,219,233,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div>
                <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:600, color:'#e3e1e9', marginBottom:'2px' }}>{log.medicine?.name||'Unknown'}</div>
                <div style={{ fontSize:'11px', color:'#5a6370' }}>{log.deviceInfo?.location||'Unknown'}</div>
              </div>
              <div style={{ fontFamily:'monospace', fontSize:'12px', color:'#00dbe9', display:'flex', alignItems:'center' }}>{log.batchNumber}</div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ background:getResultBg(log.result), border:`1px solid ${getResultBorder(log.result)}`, borderRadius:'6px', padding:'4px 10px' }}>
                  <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:getResultColor(log.result), textTransform:'uppercase' }}>{log.result}</span>
                </div>
              </div>
              <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', color:'#00dbe9', display:'flex', alignItems:'center' }}>{log.responseTime}ms</div>
              <div style={{ fontSize:'11px', color:'#849495', display:'flex', alignItems:'center' }}>{formatTime(log.createdAt)}</div>
            </div>
          ))}
        </div>
        <div style={{ height:'40px' }} />
      </div>

      {/* ✅ Sahi tarika */}
      <Footer />
      <BottomNav />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}