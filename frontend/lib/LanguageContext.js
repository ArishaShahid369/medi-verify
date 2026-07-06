'use client'
import { useLanguage } from '../lib/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, changeLanguage, languages } = useLanguage()

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 219, 233, 0.25)',
          borderRadius: '10px',
          padding: '8px 12px',
          color: '#00dbe9',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          backdropFilter: 'blur(10px)'
        }}
      >
        {Object.keys(languages).map((code) => (
          <option key={code} value={code} style={{ background: '#0a0b10', color: '#e3e1e9' }}>
            {languages[code].flag} {languages[code].name}
          </option>
        ))}
      </select>
    </div>
  )
}