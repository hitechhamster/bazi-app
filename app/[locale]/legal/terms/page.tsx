import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { LEGAL_CONTENT, LEGAL_META, type Locale } from '@/lib/legal/content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.terms' })
  return {
    title: `${t('title')} | Bazi Master`,
    description: t('description'),
  }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const validLocales: Locale[] = ['en', 'zh-CN', 'zh-TW']
  if (!validLocales.includes(locale as Locale)) notFound()

  const doc = LEGAL_CONTENT.terms[locale as Locale]

  return (
    <>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 500,
        color: '#1c1917',
        marginBottom: '8px',
      }}>
        {doc.title}
      </h1>

      <p style={{
        fontSize: '12px',
        color: '#78716c',
        marginBottom: '40px',
      }}>
        {doc.lastUpdatedLabel}: {LEGAL_META.effectiveDate}
      </p>

      {doc.sections.map((section, i) => (
        <section key={i}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#1c1917',
            marginTop: '40px',
            marginBottom: '16px',
          }}>
            {section.heading}
          </h2>
          {section.body.map((para, j) => (
            <p key={j} style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#44403c',
              lineHeight: 1.75,
              marginBottom: '20px',
            }}>
              {para}
            </p>
          ))}
        </section>
      ))}
    </>
  )
}
