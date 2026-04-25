import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import HomeHero from './_home/HomeHero'
import HomeFeatures from './_home/HomeFeatures'
import HomeWhatIsBazi from './_home/HomeWhatIsBazi'
import HomeProcess from './_home/HomeProcess'
import HomeCTA from './_home/HomeCTA'
import HomeFooter from './_home/HomeFooter'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--zen-paper)', position: 'relative' }}>
      <div className="zen-circle-bg" aria-hidden="true" />

      {/* Top nav: BrandMark left, Login right */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--zen-gold-pale)',
      }}>
        <BrandMark variant="full" size="small" href="/" />
        <Link href="/login" style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: '#854F0B',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          {t('topNav.login')}
        </Link>
      </header>

      <HomeHero />
      <HomeFeatures />
      <HomeWhatIsBazi />
      <HomeProcess />
      <HomeCTA />
      <HomeFooter />
    </main>
  )
}
