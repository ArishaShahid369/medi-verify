'use client'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BatchesPage() {
  const router = useRouter()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchMedicines() }, [])

  const fetchMedicines = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/medicines')
      const data = await res.json()
      if (data.success) setMedicines(data.medicines)
    } catch (err) {
      setMedicines([
        { _id:'1', name:'Amoxicillin CL', batchNumber:'M-10293', dosage:'500mg', status:'active', verificationCount:1248, expiryDate:'2026-12-31', manufacturerName:'PharmaCorp Global', sha256Hash:'6d7a59266d3127e338ac7d6feb1aaaf...', isOnChain:true, createdAt: new Date().toISOString() },
        { _id:'2', name:'Paracet-Max', batchNumber:'BXC-0021', dosage:'1000mg', status:'active', verificationCount:892, expiryDate:'2026-06-30', manufacturerName:'MedLine Pharma', sha256Hash:'a8f2e4c9d1b7f5e3a2c6d8f4b1e9a7...', isOnChain:true, createdAt: new Date().toISOString() },
        { _id:'3', name:'Ciprofloxacin', batchNumber:'BXC-0023', dosage:'500mg', status:'flagged', verificationCount:43, expiryDate:'2025-12-31', manufacturerName:'BioSafe Labs', sha256Hash:'9f2b4e7a1c5d8f3b6e9a2c5d8f1b4e...', isOnChain:true, createdAt: new Date().toISOString() },
        { _id:'4', name:'Metformin HCl', batchNumber:'BXC-0024', dosage:'500mg', status:'active', verificationCount:567, expiryDate:'2027-03-31', manufacturerName:'DiabeCare Pharma', sha256Hash:'3e8c1a4d7f2b5e8a1c4d7f0b3e6a9c...', isOnChain:true, createdAt: new Date().toISOString() },
      ])
    } finally { setLoading(false) }
  }

  const filtered = medicines.filter(m => {
    const matchFilter = filter === 'all' || m.status === filter
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.batchNumber.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const statusColor = s => s === 'active' ? '#00f5a0' : s === 'flagged' ? '#ff4d6d' : s === 'recalled' ? '#ff9500' : '#c5c4de'
  const statusBg = s => s === 'active' ? 'rgba(0,245,160,0.1)' : s === 'flagged' ? 'rgba(255,77,109,0.1)' : 'rgba(197,196,222,0.1)'
  const statusBorder = s => s === 'active' ? 'rgba(0,245,160,0.3)' : s === 'flagged' ? 'rgba(255,77,109,0.3)' : 'rgba(197,196,222,0.2)'

  return (
    <div style={{ minHeight:'100vh', background:'#0A0B10', fontFamily:'Inter, sans-serif' }}>
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', background:'radial-gradient(ellipse, rgba(0,219,233,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* Navbar */}
     <Navbar />

      <div style={{ padding:'28px 20px', maxWidth:'1000px', margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00dbe9', boxShadow:'0 0 8px #00dbe9' }} />
              <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, color:'#00dbe9', letterSpacing:'0.14em' }}>BLOCKCHAIN REGISTRY</span>
            </div>
            <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'28px', color:'#e3e1e9', marginBottom:'6px' }}>Medicine Batches</h1>
            <p style={{ fontSize:'13px', color:'#849495' }}>All registered medicines — immutable blockchain records</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ background:'#00dbe9', border:'none', borderRadius:'12px', padding:'13px 24px', color:'#001214', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 0 20px rgba(0,219,233,0.35)', display:'flex', alignItems:'center', gap:'8px' }}>
            + Register New Batch
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Total Batches', val: medicines.length, color:'#00dbe9', icon:'📦' },
            { label:'Active', val: medicines.filter(m=>m.status==='active').length, color:'#00f5a0', icon:'✅' },
            { label:'Flagged', val: medicines.filter(m=>m.status==='flagged').length, color:'#ff4d6d', icon:'⚠️' },
            { label:'On Blockchain', val: medicines.filter(m=>m.isOnChain).length, color:'#c5c4de', icon:'⛓️' },
          ].map((s,i) => (
            <div key={i} style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border:`1px solid ${s.color}25`, borderRadius:'16px', padding:'16px', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:`linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
              <div style={{ fontSize:'22px', marginBottom:'8px' }}>{s.icon}</div>
              <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, fontSize:'28px', color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:'11px', color:'#849495', marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:'200px', position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:'#849495' }}>🔍</span>
            <input type="text" placeholder="Search medicine or batch number..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px 12px 40px', color:'#e3e1e9', fontFamily:'Inter, sans-serif', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {['all','active','flagged','recalled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'10px 16px', background: filter===f ? 'rgba(0,219,233,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${filter===f ? 'rgba(0,219,233,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'10px', color: filter===f ? '#00dbe9' : '#849495', fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Batches Grid */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:'3px solid rgba(0,219,233,0.2)', borderTop:'3px solid #00dbe9', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
            <p style={{ color:'#849495' }}>Loading batches from blockchain...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px', background:'rgba(255,255,255,0.03)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📦</div>
            <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'18px', color:'#e3e1e9', marginBottom:'8px' }}>No Batches Found</h3>
            <p style={{ fontSize:'13px', color:'#849495' }}>Register a medicine to see it here</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px', marginBottom:'100px' }}>
            {filtered.map((med, i) => (
              <div key={med._id} onClick={() => setSelected(selected?._id === med._id ? null : med)} style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border:`1px solid ${selected?._id === med._id ? 'rgba(0,219,233,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'20px', padding:'20px', backdropFilter:'blur(12px)', cursor:'pointer', position:'relative', overflow:'hidden', transition:'all 0.3s' }}>
                <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1px', background:`linear-gradient(90deg, transparent, ${statusColor(med.status)}50, transparent)` }} />

                {/* Card header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <div>
                    <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', fontWeight:700, color:'#e3e1e9', marginBottom:'4px' }}>{med.name}</h3>
                    <span style={{ fontFamily:'monospace', fontSize:'12px', color:'#00dbe9' }}>{med.batchNumber}</span>
                  </div>
                  <div style={{ background:statusBg(med.status), border:`1px solid ${statusBorder(med.status)}`, borderRadius:'8px', padding:'4px 10px' }}>
                    <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, color:statusColor(med.status), textTransform:'uppercase' }}>{med.status}</span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                  {[
                    { label:'Dosage', val: med.dosage },
                    { label:'Verified', val: `${med.verificationCount || 0}x` },
                    { label:'Expiry', val: new Date(med.expiryDate).toLocaleDateString('en-US', { month:'short', year:'numeric' }) },
                    { label:'On-Chain', val: med.isOnChain ? '✓ Yes' : '⏳ Pending' },
                  ].map((d,j) => (
                    <div key={j} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px 10px' }}>
                      <p style={{ fontSize:'9px', color:'#5a6370', fontFamily:'Space Grotesk, sans-serif', fontWeight:600, letterSpacing:'0.08em', marginBottom:'3px' }}>{d.label.toUpperCase()}</p>
                      <p style={{ fontSize:'13px', color: d.label==='On-Chain' ? '#00f5a0' : '#e3e1e9', fontFamily:'Space Grotesk, sans-serif', fontWeight:600 }}>{d.val}</p>
                    </div>
                  ))}
                </div>

                {/* Hash */}
                <div style={{ background:'rgba(0,219,233,0.05)', border:'1px solid rgba(0,219,233,0.1)', borderRadius:'8px', padding:'8px 12px', marginBottom:'12px' }}>
                  <p style={{ fontSize:'9px', color:'#00dbe9', fontFamily:'Space Grotesk, sans-serif', fontWeight:700, letterSpacing:'0.1em', marginBottom:'3px' }}>SHA-256 HASH</p>
                  <p style={{ fontFamily:'monospace', fontSize:'10px', color:'#849495' }}>{med.sha256Hash?.slice(0,32)}...</p>
                </div>

                {/* Action buttons */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <button onClick={e => { e.stopPropagation(); router.push(`/result?batch=${med.batchNumber}`) }} style={{ padding:'10px', background:'rgba(0,219,233,0.1)', border:'1px solid rgba(0,219,233,0.2)', borderRadius:'10px', color:'#00dbe9', fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, cursor:'pointer', letterSpacing:'0.06em' }}>
                    🔍 VERIFY
                  </button>
                  <button onClick={e => { e.stopPropagation(); router.push(`/scan`) }} style={{ padding:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#e3e1e9', fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', fontWeight:700, cursor:'pointer', letterSpacing:'0.06em' }}>
                    📷 SCAN
                  </button>
                </div>

                {/* Manufacturer */}
                <div style={{ marginTop:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'10px' }}>🏭</span>
                  <span style={{ fontSize:'11px', color:'#849495' }}>{med.manufacturerName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <Footer />
<BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}