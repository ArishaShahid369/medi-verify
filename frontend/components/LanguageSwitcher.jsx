'use client'
import { useState } from 'react'
import { useLanguage } from '../lib/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, changeLanguage, languages } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', color: '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
      >
        <span>{languages[lang]?.flag}</span>
        <span>{languages[lang]?.name}</span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '110%', right: 0, background: '#0d0e13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', zIndex: 200, minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {Object.entries(languages).map(([code, info]) => (
            <button
              key={code}
              onClick={() => { changeLanguage(code); setOpen(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: lang === code ? 'rgba(0,219,233,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: lang === code ? '#00dbe9' : '#e3e1e9', fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '18px' }}>{info.flag}</span>
              <span>{info.name}</span>
              {lang === code && <span style={{ marginLeft: 'auto', color: '#00dbe9' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}