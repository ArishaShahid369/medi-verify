'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const languages = {
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  ur: { name: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  bn: { name: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [messages, setMessages] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('mediverify_lang') || 'en'
    setLang(saved)
    loadMessages(saved)
  }, [])

  const loadMessages = async (language) => {
    try {
      // 🟢 Ek dafa peeche ja kar messages folder mein check karein
      const msgs = await import(`../messages/${language}.json`)
      setMessages(msgs.default)
    } catch {
      // 🟢 Catch block mein bhi path theek kar dein
      const msgs = await import(`../messages/en.json`)
      setMessages(msgs.default)
    }
  }

  const changeLanguage = (newLang) => {
    setLang(newLang)
    localStorage.setItem('mediverify_lang', newLang)
    loadMessages(newLang)
    document.documentElement.dir = languages[newLang]?.dir || 'ltr'
  }

  const t = (key) => {
    const keys = key.split('.')
    let val = messages
    for (const k of keys) {
      val = val?.[k]
    }
    return val || key
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 👑 YEH LINE SAB SE IMPORTANT HAI JO MISSING THI!
export const useLanguage = () => useContext(LanguageContext)