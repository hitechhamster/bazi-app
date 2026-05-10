export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="max-w-3xl mx-auto px-6 py-12"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {children}
    </article>
  )
}
