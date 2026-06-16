'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function LiveChart() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    const points = Array.from({ length: 60 }, (_, i) => ({ y: 40 + Math.sin(i * 0.3) * 20 + Math.random() * 10 }))
    let t = 0
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(0,219,233,0.06)'; ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(0, (H/4)*i); ctx.lineTo(W, (H/4)*i); ctx.stroke() }
      points.shift(); points.push({ y: 40 + Math.sin(t*0.3)*20 + Math.sin(t*0.7)*15 + Math.random()*10 })
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, 'rgba(0,219,233,0.2)'); grad.addColorStop(1, 'rgba(0,219,233,0)')
      ctx.beginPath()
      points.forEach((p, i) => { const x=(i/59)*W, y=H-(p.y/100)*H; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y) })
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fillStyle=grad; ctx.fill()
      ctx.beginPath(); ctx.strokeStyle='#00dbe9'; ctx.lineWidth=2.5
      ctx.shadowColor='rgba(0,219,233,0.6)'; ctx.shadowBlur=8
      points.forEach((p,i)=>{ const x=(i/59)*W,y=H-(p.y/100)*H; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y) })
      ctx.stroke(); ctx.shadowBlur=0
      t+=0.15; animId=requestAnimationFrame(draw)
    }
    draw()
    return ()=>cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} style={{ width:'100%', height:'180px', display:'block' }} />
}

function WorldMap() {
  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 220" style={{ position:'absolute', inset:0 }}>
        {[40,80,120,160].map(y=><line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(0,219,233,0.06)" strokeWidth="1"/>)}
        {[80,160,240,320].map(x=><line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(0,219,233,0.06)" strokeWidth="1"/>)}
        <path d="M30,60 Q60,50 90,65 Q100,80 80,95 Q50,100 30,85 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1"/>
        <path d="M110,45 Q160,35 200,50 Q220,70 200,100 Q160,110 120,90 Q100,70 110,45 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1"/>
        <path d="M230,55 Q280,45 320,60 Q340,80 320,110 Q280,120 240,100 Q220,80 230,55 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1"/>
        <path d="M340,50 Q380,45 395,65 Q390,90 360,95 Q335,85 340,50 Z" fill="rgba(0,219,233,0.08)" stroke="rgba(0,219,233,0.15)" strokeWidth="1"/>
        {[[80,70,'#00dbe9'],[160,55,'#00f5a0'],[280,70,'#00dbe9'],[370,65,'#ff4d6d'],[100,145,'#c5c4de'],[170,150,'#00f5a0'],[220,80,'#00dbe9'],[40,80,'#00dbe9']].map((n,i)=>(
          <g key={i}><circle cx={n[0]} cy={n[1]} r="8" fill={`${n[2]}15`} stroke={`${n[2]}40`} strokeWidth="1"/><circle cx={n[0]} cy={n[1]} r="3" fill={n[2]}/></g>
        ))}
      </svg>
    </div>
  )
}

// ── Overview Section ──
function OverviewSection({ stats, tableData, time }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', marginBottom:'24px' }}>
        {stats.map((s,i)=>(
          <div key={i} style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'24px', position:'relative', overflow:'hidden', backdropFilter:'blur(12px)' }}>
            <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:`linear-gradient(90deg, transparent, ${s.color}50, transparent)` }}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.12em' }}>{s.label}</p>
              <span style={{ fontSize:'24px', opacity:0.3 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'36px', color:s.color, lineHeight:1, marginBottom:'6px' }}>{s.val}</div>
            {s.change&&<div style={{ display:'flex', alignItems:'center', gap:'6px' }}><span style={{ fontSize:'12px', color:'#00f5a0', fontWeight:700 }}>{s.change}</span><div style={{ flex:1, height:'3px', borderRadius:'999px', background:'rgba(255,255,255,0.05)', overflow:'hidden' }}><div style={{ height:'100%', width:'60%', background:`linear-gradient(90deg, ${s.color}, transparent)` }}/></div></div>}
            {s.badge&&<span style={{ fontSize:'10px', color:s.color, fontFamily:'Space Grotesk, sans-serif', fontWeight:700, letterSpacing:'0.1em' }}>{s.badge}</span>}
            <p style={{ fontSize:'11px', color:'#5a6370', marginTop:'6px' }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', marginBottom:'24px' }}>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'24px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
            <div><h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>Live Ledger Activity</h3><p style={{ fontSize:'12px', color:'#5a6370' }}>Real-time authentication requests across global nodes</p></div>
            <div style={{ display:'flex', gap:'8px' }}>{['LIVE','24H'].map(l=><div key={l} style={{ background:'rgba(0,219,233,0.1)', border:'1px solid rgba(0,219,233,0.2)', borderRadius:'8px', padding:'5px 12px' }}><span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#00dbe9' }}>{l}</span></div>)}</div>
          </div>
          <LiveChart/>
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'24px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }}/>
          <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'15px', fontWeight:700, color:'#e3e1e9', marginBottom:'16px' }}>Verification Nodes</h3>
          <div style={{ height:'160px', marginBottom:'16px' }}><WorldMap/></div>
          {[{label:'Active Terminals',val:'4,812',color:'#00dbe9'},{label:'Avg Latency',val:'42ms',color:'#00f5a0'},{label:'Fraud Alerts',val:'2 Critical',color:'#ff4d6d'}].map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:i<2?'1px solid rgba(255,255,255,0.04)':'none' }}>
              <span style={{ fontSize:'12px', color:'#849495', fontFamily:'Space Grotesk, sans-serif', fontWeight:600 }}>{r.label}</span>
              <span style={{ fontSize:'12px', color:r.color, fontFamily:'Space Grotesk, sans-serif', fontWeight:700 }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
      <LedgerTable tableData={tableData}/>
    </div>
  )
}

// ── Ledger Table ──
function LedgerTable({ tableData }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'24px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div><h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>Immutable Ledger History</h3><p style={{ fontSize:'12px', color:'#5a6370' }}>Cryptographic proof of batch composition and distribution</p></div>
        <button style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 18px', color:'#e3e1e9', fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', fontWeight:600, cursor:'pointer', letterSpacing:'0.06em' }}>EXPORT AUDIT LOG</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'0.7fr 1fr 1.2fr 1fr 1fr 0.6fr', gap:'12px', padding:'10px 16px', marginBottom:'4px' }}>
        {['BATCH ID','PRODUCT NAME','SALT COMPOSITION','TIMESTAMP','BLOCKCHAIN HASH','STATUS'].map(h=><span key={h} style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', fontWeight:700, color:'#5a6370', letterSpacing:'0.1em' }}>{h}</span>)}
      </div>
      {tableData.map((row,i)=>(
        <div key={i} style={{ display:'grid', gridTemplateColumns:'0.7fr 1fr 1.2fr 1fr 1fr 0.6fr', gap:'12px', padding:'14px 16px', borderRadius:'12px', marginBottom:'4px', background:i%2===0?'rgba(255,255,255,0.02)':'transparent', border:'1px solid rgba(255,255,255,0.04)', cursor:'pointer' }}>
          <span style={{ fontFamily:'monospace', fontSize:'12px', color:'#00dbe9' }}>{row.id}</span>
          <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:600, color:'#e3e1e9' }}>{row.name}</span>
          <span style={{ fontSize:'11px', color:'#849495' }}>{row.salt}</span>
          <span style={{ fontFamily:'monospace', fontSize:'11px', color:'#5a6370' }}>{row.ts}</span>
          <span style={{ fontFamily:'monospace', fontSize:'11px', color:'#00dbe9' }}>{row.hash}</span>
          <div style={{ display:'flex', alignItems:'center' }}>
            <div style={{ background:row.status==='VERIFIED'?'rgba(0,245,160,0.1)':row.status==='FLAGGED'?'rgba(255,77,109,0.1)':'rgba(197,196,222,0.1)', border:`1px solid ${row.status==='VERIFIED'?'rgba(0,245,160,0.3)':row.status==='FLAGGED'?'rgba(255,77,109,0.3)':'rgba(197,196,222,0.2)'}`, borderRadius:'6px', padding:'4px 10px' }}>
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', fontWeight:700, color:row.status==='VERIFIED'?'#00f5a0':row.status==='FLAGGED'?'#ff4d6d':'#c5c4de' }}>{row.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function InventorySection({ tableData }) {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [recallModal, setRecallModal] = useState(null)
  const [recallForm, setRecallForm] = useState({ reasonCategory: 'under_investigation', fullReason: '', affectedRegions: '' })
  const [recalling, setRecalling] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  useEffect(() => { fetchMedicines() }, [])

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_URL}/medicines`)
      const data = await res.json()
      if (data.success) setMedicines(data.medicines)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleRecall = async () => {
    if (!recallModal) return
    setRecalling(true)
    try {
      const res = await fetch(`${API_URL}/medicines/${recallModal._id}/recall`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasonCategory: recallForm.reasonCategory,
          fullReason: recallForm.fullReason,
          affectedRegions: recallForm.affectedRegions.split(',').map(r => r.trim()).filter(Boolean),
        })
      })
      const data = await res.json()
      if (data.success) {
        setRecallModal(null)
        setRecallForm({ reasonCategory: 'under_investigation', fullReason: '', affectedRegions: '' })
        fetchMedicines()
      }
    } catch (err) {
      console.error(err)
    } finally { setRecalling(false) }
  }

  const statusColor = s => s==='active'?'#00f5a0':s==='recalled'?'#ff4d6d':s==='flagged'?'#ff9500':'#c5c4de'

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div><h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>Medicine Inventory</h2><p style={{ fontSize:'13px', color:'#5a6370' }}>All registered medicines on blockchain</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Total Medicines', val:medicines.length, color:'#00dbe9' },
          { label:'Active', val:medicines.filter(m=>m.status==='active').length, color:'#00f5a0' },
          { label:'Recalled', val:medicines.filter(m=>m.status==='recalled').length, color:'#ff4d6d' },
          { label:'Flagged', val:medicines.filter(m=>m.status==='flagged').length, color:'#ff9500' },
        ].map((s,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${s.color}25`, borderRadius:'16px', padding:'20px', backdropFilter:'blur(12px)' }}>
            <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.12em', marginBottom:'8px' }}>{s.label}</p>
            <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'32px', color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'2px solid rgba(0,219,233,0.2)', borderTop:'2px solid #00dbe9', animation:'spin 1s linear infinite', margin:'0 auto' }} />
        </div>
      ) : (
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 0.8fr 0.8fr 0.6fr', gap:'12px', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
            {['MEDICINE','BATCH','DOSAGE','STATUS','ACTION'].map(h=><span key={h} style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', fontWeight:700, color:'#5a6370', letterSpacing:'0.1em' }}>{h}</span>)}
          </div>
          {medicines.map((med,i)=>(
            <div key={med._id} style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 0.8fr 0.8fr 0.6fr', gap:'12px', padding:'14px 20px', borderBottom: i<medicines.length-1?'1px solid rgba(255,255,255,0.04)':'none', alignItems:'center' }}>
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:600, color:'#e3e1e9' }}>{med.name}</span>
              <span style={{ fontFamily:'monospace', fontSize:'12px', color:'#00dbe9' }}>{med.batchNumber}</span>
              <span style={{ fontSize:'12px', color:'#849495' }}>{med.dosage}</span>
              <div>
                <span style={{ background:`${statusColor(med.status)}15`, border:`1px solid ${statusColor(med.status)}40`, borderRadius:'6px', padding:'4px 10px', fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', fontWeight:700, color:statusColor(med.status), textTransform:'uppercase' }}>{med.status}</span>
              </div>
              <div>
                {med.status === 'active' && (
                  <button onClick={()=>setRecallModal(med)} style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.3)', borderRadius:'8px', padding:'6px 12px', color:'#ff4d6d', fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
                    ⚠️ RECALL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recall Modal */}
      {recallModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'20px' }}>
          <div style={{ background:'#0d0e13', border:'1px solid rgba(255,77,109,0.3)', borderRadius:'24px', padding:'32px', maxWidth:'480px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <span style={{ fontSize:'32px' }}>⚠️</span>
              <div>
                <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'18px', fontWeight:700, color:'#ff4d6d' }}>Recall Batch</h3>
                <p style={{ fontSize:'12px', color:'#849495' }}>{recallModal.name} — {recallModal.batchNumber}</p>
              </div>
            </div>

            <div style={{ background:'rgba(255,77,109,0.06)', border:'1px solid rgba(255,77,109,0.15)', borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
              <p style={{ fontSize:'12px', color:'#ff9eae', lineHeight:1.6 }}>
                🔒 <strong>Zero-Knowledge Privacy:</strong> Public consumers will only see "RECALLED — Do Not Use" until you mark the investigation complete. Full reason stays private during active investigation.
              </p>
            </div>

            <label style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.1em', display:'block', marginBottom:'8px' }}>REASON CATEGORY</label>
            <select value={recallForm.reasonCategory} onChange={e=>setRecallForm({...recallForm, reasonCategory:e.target.value})} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', color:'#e3e1e9', marginBottom:'16px', fontFamily:'Inter, sans-serif', fontSize:'13px' }}>
              <option value="under_investigation">Under Investigation</option>
              <option value="contamination">Contamination</option>
              <option value="labeling_error">Labeling Error</option>
              <option value="efficacy_issue">Efficacy Issue</option>
              <option value="packaging_defect">Packaging Defect</option>
            </select>

            <label style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.1em', display:'block', marginBottom:'8px' }}>INTERNAL REASON (private until investigation complete)</label>
            <textarea value={recallForm.fullReason} onChange={e=>setRecallForm({...recallForm, fullReason:e.target.value})} placeholder="e.g. Trace contamination found in lot during routine QC re-test" style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', color:'#e3e1e9', marginBottom:'16px', fontFamily:'Inter, sans-serif', fontSize:'13px', minHeight:'70px', resize:'vertical', boxSizing:'border-box' }} />

            <label style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.1em', display:'block', marginBottom:'8px' }}>AFFECTED REGIONS (comma separated)</label>
            <input type="text" value={recallForm.affectedRegions} onChange={e=>setRecallForm({...recallForm, affectedRegions:e.target.value})} placeholder="Karachi, Lahore, Islamabad" style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px', color:'#e3e1e9', marginBottom:'24px', fontFamily:'Inter, sans-serif', fontSize:'13px', boxSizing:'border-box' }} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <button onClick={()=>setRecallModal(null)} style={{ padding:'14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#e3e1e9', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleRecall} disabled={recalling} style={{ padding:'14px', background:'#ff4d6d', border:'none', borderRadius:'12px', color:'#fff', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 0 20px rgba(255,77,109,0.3)' }}>
                {recalling ? '⏳ Recalling...' : '⚠️ Confirm Recall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ── Batch Release Section ──
function BatchSection() {
  const [form, setForm] = useState({
    name: '', genericName: '', batchNumber: '',
    dosage: '', expiryDate: '', saltComposition: '',
    licenseNumber: '', manufacturerName: '', drugType: 'tablet',
    storageConditions: 'Store below 25°C', manufacturingLocation: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.batchNumber || !form.dosage) {
      setError('Please fill all required fields!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/medicines/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.medicine)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Server connection failed!')
    }
    setLoading(false)
  }

  const downloadQR = () => {
    if (!result?.qrCode) return
    const link = document.createElement('a')
    link.download = `QR-${result.batchNumber}.png`
    link.href = result.qrCode
    link.click()
  }

  const printQR = () => {
    if (!result?.qrCode) return
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>MediVerify QR — ${result.name}</title>
      <style>
        body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
        .card { border: 2px solid #000; padding: 24px; text-align: center; width: 300px; border-radius: 12px; }
        .logo { font-size: 18px; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px; }
        .name { font-size: 16px; font-weight: 700; margin: 12px 0 4px; }
        .batch { font-size: 12px; color: #555; margin-bottom: 12px; }
        .hash { font-size: 9px; color: #777; word-break: break-all; margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 6px; }
        .scan-text { font-size: 11px; color: #333; margin-top: 10px; font-weight: 600; }
        img { width: 200px; height: 200px; }
        .divider { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
      </style></head>
      <body><div class="card">
        <div class="logo">🔬 MEDI-VERIFY</div>
        <div class="scan-text">Scan to Verify Authenticity</div>
        <hr class="divider"/>
        <img src="${result.qrCode}" alt="QR Code"/>
        <div class="name">${result.name}</div>
        <div class="batch">Batch: ${result.batchNumber}</div>
        <div class="batch">Serial: ${result.serialNumber}</div>
        <hr class="divider"/>
        <div class="hash">SHA-256: ${result.sha256Hash}</div>
        <div class="scan-text" style="margin-top:8px; font-size:10px; color:#777;">Powered by MediVerify Blockchain</div>
      </div></body></html>
    `)
    win.document.close()
    win.print()
  }

  if (result) return (
    <div>
      <div style={{ background:'rgba(0,245,160,0.06)', border:'1px solid rgba(0,245,160,0.2)', borderRadius:'20px', padding:'28px', marginBottom:'20px', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'12px' }}>✅</div>
        <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:700, color:'#00f5a0', marginBottom:'6px' }}>Medicine Registered!</h3>
        <p style={{ fontSize:'13px', color:'#849495', marginBottom:'20px' }}>Successfully saved to blockchain database</p>

        {/* QR Code Display */}
        <div style={{ background:'white', padding:'20px', borderRadius:'16px', display:'inline-block', marginBottom:'20px', boxShadow:'0 0 30px rgba(0,219,233,0.2)' }}>
          <img src={result.qrCode} alt="QR Code" style={{ width:'200px', height:'200px', display:'block' }} />
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px', marginBottom:'20px', textAlign:'left' }}>
          {[
            { label:'Medicine', val: result.name },
            { label:'Batch Number', val: result.batchNumber },
            { label:'Serial Number', val: result.serialNumber },
            { label:'SHA-256 Hash', val: result.sha256Hash?.slice(0,32) + '...' },
          ].map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i<3?'1px solid rgba(255,255,255,0.05)':'none' }}>
              <span style={{ fontSize:'12px', color:'#849495', fontFamily:'Space Grotesk, sans-serif', fontWeight:600 }}>{r.label}</span>
              <span style={{ fontSize:'12px', color:'#00dbe9', fontFamily:'monospace', maxWidth:'200px', textAlign:'right', wordBreak:'break-all' }}>{r.val}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
          <button onClick={downloadQR} style={{ padding:'14px', background:'#00dbe9', color:'#001214', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'12px', border:'none', borderRadius:'12px', cursor:'pointer', boxShadow:'0 0 20px rgba(0,219,233,0.4)' }}>
            ↓ DOWNLOAD QR
          </button>
          <button onClick={printQR} style={{ padding:'14px', background:'rgba(0,219,233,0.1)', border:'1px solid rgba(0,219,233,0.3)', borderRadius:'12px', color:'#00dbe9', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            🖨️ PRINT QR CARD
          </button>
          <button onClick={() => { setResult(null); setForm({ name:'', genericName:'', batchNumber:'', dosage:'', expiryDate:'', saltComposition:'', licenseNumber:'', manufacturerName:'', drugType:'tablet', storageConditions:'Store below 25°C', manufacturingLocation:'' }) }} style={{ padding:'14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#e3e1e9', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            + REGISTER MORE
          </button>
        </div>

        <div style={{ marginTop:'16px', padding:'14px', background:'rgba(0,219,233,0.05)', border:'1px solid rgba(0,219,233,0.15)', borderRadius:'12px', textAlign:'left' }}>
          <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, color:'#00dbe9', marginBottom:'6px' }}>🔗 VERIFY LINK:</p>
          <p style={{ fontFamily:'monospace', fontSize:'11px', color:'#849495', wordBreak:'break-all' }}>
            {`http://localhost:3000/result?hash=${result.sha256Hash}`}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>Register New Medicine Batch</h2>
        <p style={{ fontSize:'13px', color:'#5a6370' }}>Register medicine on blockchain — QR code will be auto-generated</p>
      </div>
      {error && <div style={{ background:'rgba(255,77,109,0.1)', border:'1px solid rgba(255,77,109,0.3)', borderRadius:'12px', padding:'14px', marginBottom:'16px', color:'#ff4d6d', fontFamily:'Space Grotesk, sans-serif', fontSize:'13px' }}>⚠️ {error}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {[
          { label:'Medicine Name *', key:'name', placeholder:'e.g. Amoxicillin CL', required: true },
          { label:'Generic Name *', key:'genericName', placeholder:'e.g. Amoxicillin Trihydrate', required: true },
          { label:'Batch Number *', key:'batchNumber', placeholder:'e.g. MV-2024-001', required: true },
          { label:'Dosage *', key:'dosage', placeholder:'e.g. 500mg', required: true },
          { label:'Manufacture Date', key:'manufactureDate', placeholder:'2024-01-15', type:'date' },
          { label:'Expiry Date', key:'expiryDate', placeholder:'2026-12-31', type:'date' },
          { label:'License Number', key:'licenseNumber', placeholder:'e.g. LIC-445-GLOBAL' },
          { label:'Manufacturer Name', key:'manufacturerName', placeholder:'e.g. PharmaCorp Global' },
          { label:'Manufacturing Location', key:'manufacturingLocation', placeholder:'e.g. Karachi, Pakistan' },
          { label:'Storage Conditions', key:'storageConditions', placeholder:'e.g. Store below 25°C' },
        ].map((f,i)=>(
          <div key={i}>
            <label style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color: f.required ? '#00dbe9' : '#849495', letterSpacing:'0.12em', display:'block', marginBottom:'8px' }}>{f.label.toUpperCase()}</label>
            <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e=>setForm({...form,[f.key]:e.target.value})} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${f.required?'rgba(0,219,233,0.2)':'rgba(255,255,255,0.1)'}`, borderRadius:'12px', padding:'14px 16px', color:'#e3e1e9', fontFamily:'Inter, sans-serif', fontSize:'13px', outline:'none', boxSizing:'border-box' }}/>
          </div>
        ))}
        <div style={{ gridColumn:'1 / -1' }}>
          <label style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#849495', letterSpacing:'0.12em', display:'block', marginBottom:'8px' }}>SALT COMPOSITION</label>
          <textarea placeholder="e.g. Amoxicillin Trihydrate (500mg) + Potassium Clavulanate (125mg)" value={form.saltComposition || ''} onChange={e=>setForm({...form,saltComposition:e.target.value})} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'14px 16px', color:'#e3e1e9', fontFamily:'Inter, sans-serif', fontSize:'13px', outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:'80px' }}/>
        </div>
        <div style={{ gridColumn:'1 / -1', marginTop:'8px' }}>
          <button onClick={handleSubmit} disabled={loading} style={{ width:'100%', padding:'18px', background: loading?'rgba(0,219,233,0.3)':'#00dbe9', color:'#001214', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'15px', letterSpacing:'0.1em', border:'none', borderRadius:'14px', cursor: loading?'not-allowed':'pointer', boxShadow:'0 0 24px rgba(0,219,233,0.4)', transition:'all 0.3s' }}>
            {loading ? '⏳ Registering on Blockchain...' : '⛓️ REGISTER ON BLOCKCHAIN + GENERATE QR'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Supply Chain Section ──
function SupplyChainSection() {
  const [chains, setChains] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/verify/supply-chain')
      .then(r => r.json())
      .then(data => {
        if (data.success) setChains(data.medicines)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,219,233,0.2)', borderTop: '3px solid #00dbe9', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: '#849495', fontFamily: 'Space Grotesk, sans-serif' }}>Loading live supply chain...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: '#e3e1e9', marginBottom: '4px' }}>Live Supply Chain Tracking</h2>
        <p style={{ fontSize: '13px', color: '#5a6370' }}>Real-time medicine journey — factory to consumer</p>
      </div>

      {chains.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛓️</div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', color: '#e3e1e9', marginBottom: '8px' }}>No Supply Chain Data</h3>
          <p style={{ fontSize: '13px', color: '#849495' }}>Register a medicine first to see supply chain</p>
        </div>
      ) : chains.map((med, ci) => (
        <div key={ci} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px', marginBottom: '16px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,219,233,0.3), transparent)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 700, color: '#e3e1e9', marginBottom: '4px' }}>{med.name}</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00dbe9' }}>{med.batchNumber}</span>
                <span style={{ fontSize: '11px', color: '#849495' }}>• {med.verificationCount || 0} verifications</span>
              </div>
            </div>
            <div style={{ background: med.status === 'active' ? 'rgba(0,245,160,0.08)' : 'rgba(255,77,109,0.08)', border: `1px solid ${med.status === 'active' ? 'rgba(0,245,160,0.2)' : 'rgba(255,77,109,0.2)'}`, borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: med.status === 'active' ? '#00f5a0' : '#ff4d6d' }}>● {med.status?.toUpperCase()}</span>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', overflowX: 'auto', paddingBottom: '8px' }}>
            {(med.supplyChain || []).map((step, si) => (
              <div key={si} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: '120px', padding: '0 8px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: si === med.supplyChain.length - 1 ? 'rgba(0,219,233,0.15)' : 'rgba(0,245,160,0.1)', border: `2px solid ${si === med.supplyChain.length - 1 ? '#00dbe9' : '#00f5a0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: si === med.supplyChain.length - 1 ? '0 0 16px rgba(0,219,233,0.4)' : 'none' }}>
                    {si === med.supplyChain.length - 1
                      ? <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00dbe9', boxShadow: '0 0 10px #00dbe9' }} />
                      : <span style={{ fontSize: '16px' }}>✓</span>
                    }
                  </div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: si === med.supplyChain.length - 1 ? '#00dbe9' : '#e3e1e9', marginBottom: '3px' }}>{step.stage}</p>
                  <p style={{ fontSize: '10px', color: '#849495', marginBottom: '2px' }}>{step.handler}</p>
                  <p style={{ fontSize: '10px', color: '#5a6370', marginBottom: '2px' }}>{step.location}</p>
                  <p style={{ fontSize: '10px', color: '#5a6370' }}>{new Date(step.timestamp).toLocaleDateString()}</p>
                  {step.notes && <p style={{ fontSize: '9px', color: '#00dbe9', marginTop: '4px', maxWidth: '110px', lineHeight: 1.3 }}>{step.notes}</p>}
                </div>
                {si < med.supplyChain.length - 1 && (
                  <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, #00f5a0, rgba(0,219,233,0.4))', flexShrink: 0 }} />
                )}
              </div>
            ))}

            {/* Consumer (Live) */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, rgba(0,219,233,0.4), rgba(0,219,233,0.1))', flexShrink: 0 }} />
              <div style={{ textAlign: 'center', minWidth: '100px', padding: '0 8px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,219,233,0.08)', border: '2px dashed rgba(0,219,233,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <span style={{ fontSize: '18px' }}>👤</span>
                </div>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', fontWeight: 700, color: '#849495' }}>Consumer</p>
                <p style={{ fontSize: '10px', color: '#5a6370' }}>Awaiting scan</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}     

// ── Settings Section ──
function SettingsSection() {
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <div style={{ marginBottom:'28px' }}>
        <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>Settings</h2>
        <p style={{ fontSize:'13px', color:'#5a6370' }}>Manage your MediVerify account settings</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {[
          {title:'Company Name', val:'PharmaCorp Global', type:'text'},
          {title:'License Number', val:'LIC-445-GLOBAL', type:'text'},
          {title:'Contact Email', val:'admin@pharmacorp.com', type:'email'},
          {title:'Blockchain Network', val:'Ethereum Sepolia Testnet', type:'select', options:['Ethereum Mainnet','Ethereum Sepolia Testnet']},
        ].map((s,i)=>(
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>{s.title}</p>
              <p style={{ fontSize:'12px', color:'#849495' }}>{s.val}</p>
            </div>
            <button style={{ background:'rgba(0,219,233,0.08)', border:'1px solid rgba(0,219,233,0.2)', borderRadius:'8px', padding:'8px 16px', color:'#00dbe9', fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>EDIT</button>
          </div>
        ))}
        <button onClick={()=>setSaved(true)} style={{ padding:'16px', background:saved?'rgba(0,245,160,0.1)':'#00dbe9', border:saved?'1px solid rgba(0,245,160,0.3)':'none', borderRadius:'14px', color:saved?'#00f5a0':'#001214', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'14px', cursor:'pointer', boxShadow:saved?'none':'0 0 24px rgba(0,219,233,0.4)' }}>
          {saved?'✓ Settings Saved!':'SAVE SETTINGS'}
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('overview')
  const [time, setTime] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const tableData = [
    { id:'#BXC-0021', name:'Paracet-Max', salt:'C8H9NO2 (Active)', ts:'2023-11-24 09:12', hash:'0x4a9d...f281e', status:'VERIFIED' },
    { id:'#BXC-0022', name:'Amoxicillin CL', salt:'C16H19N3O5S (Active)', ts:'2023-11-24 09:45', hash:'0x71C7...4e31', status:'VERIFIED' },
    { id:'#BXC-0023', name:'Ciprofloxacin', salt:'C17H18FN3O3 (Active)', ts:'2023-11-24 10:02', hash:'0x9f2b...a17c', status:'FLAGGED' },
    { id:'#BXC-0024', name:'Metformin HCl', salt:'C4H11N5 (Active)', ts:'2023-11-24 10:18', hash:'0x3e8c...b94d', status:'VERIFIED' },
    { id:'#BXC-0025', name:'Atorvastatin', salt:'C33H35FN2O5 (Active)', ts:'2023-11-24 10:55', hash:'0x5d1f...c62a', status:'PENDING' },
  ]

  const stats = [
    { label:'ACTIVE BATCHES', val:'1,284', change:'+12%', icon:'⬡', color:'#00dbe9', sub:'Across 47 countries' },
    { label:'INTEGRITY ALERTS', val:'02', badge:'CRITICAL', icon:'🛡', color:'#ff4d6d', sub:'Last scan anomaly: Southeast Asia' },
    { label:'GLOBAL REACH', val:'94%', badge:'OPTIMAL', icon:'🌍', color:'#00f5a0', sub:'Network coverage worldwide' },
  ]

  const navItems = [
    { id:'overview', icon:'⊞', label:'OVERVIEW' },
    { id:'inventory', icon:'☰', label:'INVENTORY' },
    { id:'batch', icon:'⚙', label:'BATCH RELEASE' },
    { id:'supply', icon:'⛓', label:'SUPPLY CHAIN' },
    { id:'settings', icon:'⚙', label:'SETTINGS' },
  ]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' UTC')
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  const renderContent = () => {
    switch(activeNav) {
      case 'inventory': return <InventorySection tableData={tableData}/>
      case 'batch': return <BatchSection/>
      case 'supply': return <SupplyChainSection/>
      case 'settings': return <SettingsSection/>
      default: return <OverviewSection stats={stats} tableData={tableData} time={time}/>
    }
  }

  if (isMobile) {
    return (
      <div style={{ minHeight:'100vh', background:'#0A0B10', fontFamily:'Inter, sans-serif' }}>
        <nav style={{ position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:'rgba(10,11,16,0.95)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'linear-gradient(135deg, rgba(0,219,233,0.25), rgba(0,219,233,0.05))', border:'1px solid rgba(0,219,233,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🔬</div>
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'15px', color:'#00dbe9', letterSpacing:'0.08em' }}>MEDI-VERIFY</span>
          </div>
          <div style={{ background:'rgba(0,219,233,0.08)', border:'1px solid rgba(0,219,233,0.2)', borderRadius:'8px', padding:'6px 10px' }}>
            <span style={{ fontFamily:'monospace', fontSize:'11px', color:'#00dbe9' }}>PHARMA_01</span>
          </div>
        </nav>
        {/* Mobile nav tabs */}
        <div style={{ display:'flex', overflowX:'auto', padding:'12px 16px', gap:'8px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,11,16,0.8)' }}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setActiveNav(item.id)} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', background:activeNav===item.id?'rgba(0,219,233,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${activeNav===item.id?'rgba(0,219,233,0.3)':'rgba(255,255,255,0.07)'}`, cursor:'pointer' }}>
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, letterSpacing:'0.06em', color:activeNav===item.id?'#00dbe9':'#849495' }}>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:'20px' }}>{renderContent()}</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A0B10', fontFamily:'Inter, sans-serif', display:'flex' }}>
      {/* Sidebar */}
      <aside style={{ width:'240px', minHeight:'100vh', background:'rgba(13,14,19,0.98)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50 }}>
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'linear-gradient(135deg, rgba(0,219,233,0.25), rgba(0,219,233,0.05))', border:'1px solid rgba(0,219,233,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🔬</div>
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'14px', color:'#00dbe9', letterSpacing:'0.08em' }}>MEDI-VERIFY</span>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 12px' }}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setActiveNav(item.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderRadius:'12px', marginBottom:'4px', background:activeNav===item.id?'rgba(0,219,233,0.12)':'transparent', border:`1px solid ${activeNav===item.id?'rgba(0,219,233,0.2)':'transparent'}`, cursor:'pointer', transition:'all 0.2s' }}>
              <span style={{ fontSize:'16px', filter:activeNav===item.id?'drop-shadow(0 0 4px rgba(0,219,233,0.8))':'none' }}>{item.icon}</span>
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', fontWeight:700, letterSpacing:'0.08em', color:activeNav===item.id?'#00dbe9':'#849495' }}>{item.label}</span>
              {activeNav===item.id&&<div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'#00dbe9', boxShadow:'0 0 6px #00dbe9' }}/>}
            </button>
          ))}
        </nav>
        <button onClick={() => router.push('/')} style={{ margin:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px', color:'#849495', fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', fontWeight:600, cursor:'pointer', letterSpacing:'0.06em' }}>← Back to Home</button>
        <div style={{ padding:'16px', margin:'0 12px 12px', background:'rgba(0,219,233,0.04)', border:'1px solid rgba(0,219,233,0.1)', borderRadius:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#00f5a0', boxShadow:'0 0 8px #00f5a0' }}/>
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:'#00f5a0', letterSpacing:'0.1em' }}>NODE STATUS: ACTIVE</span>
          </div>
          <p style={{ fontFamily:'monospace', fontSize:'10px', color:'#5a6370' }}>0x71C765...657D02</p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:'240px', flex:1, padding:'0', minHeight:'100vh' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,11,16,0.8)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:40 }}>
          <div>
            <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'18px', color:'#e3e1e9', marginBottom:'3px' }}>MANUFACTURER DASHBOARD</h1>
            <p style={{ fontSize:'12px', color:'#5a6370' }}>System Time: {time} | Global Verification Network</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ position:'relative', cursor:'pointer' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🔔</div>
              <div style={{ position:'absolute', top:'-3px', right:'-3px', width:'16px', height:'16px', borderRadius:'50%', background:'#ff4d6d', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 8px rgba(255,77,109,0.6)' }}>
                <span style={{ fontSize:'9px', color:'#fff', fontWeight:700 }}>2</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'10px 16px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(0,219,233,0.15)', border:'1px solid rgba(0,219,233,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>👤</div>
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:700, color:'#e3e1e9' }}>PHARMA_INTEL_01</span>
            </div>
          </div>
        </div>
        <div style={{ padding:'28px 32px' }}>{renderContent()}</div>
      </main>
    </div>
  )
}