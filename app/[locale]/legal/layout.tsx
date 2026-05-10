import BrandMark from '@/components/BrandMark'
import { localePath } from '@/lib/i18n/path'

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
      <header className="border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <BrandMark variant="full" size="small" href={localePath(locale, '/dashboard')} />
        </div>
      </header>
      <article
        className="max-w-3xl mx-auto px-6 py-12"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        {children}
      </article>
    </>
  )
}
