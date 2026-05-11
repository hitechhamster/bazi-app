import PageHeader from '@/components/PageHeader'

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <PageHeader locale={locale} />
      <article
        className="max-w-3xl mx-auto px-6 py-12"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        {children}
      </article>
    </>
  )
}
