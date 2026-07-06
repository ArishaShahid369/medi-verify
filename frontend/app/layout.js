import './globals.css'
import { LanguageProvider } from '../lib/LanguageContext'

export const metadata = {
  title: 'Medi-Verify | Blockchain Medicine Authentication',
  description: 'Instantly verify pharmaceutical authenticity using blockchain technology.',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#00dbe9',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/medicine-capsule.png" />
        <link rel="apple-touch-icon" href="/medicine-capsule.png" />
      </head>
      <body>
        {/* Poori app ko custom provider mein wrap kiya */}
        <LanguageProvider>
          {children}
        </LanguageProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}