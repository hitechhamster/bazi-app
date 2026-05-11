'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import UpgradeModal from '@/components/UpgradeModal'
import { localePath } from '@/lib/i18n/path'

export default function NewProfileButton({
  atCap,
  locale,
}: {
  atCap: boolean
  locale: string
}) {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  function handleClick() {
    if (atCap) {
      setShowModal(true)
    } else {
      router.push(localePath(locale, '/profiles/new'))
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--zen-gold)',
          border: '1px solid var(--zen-gold)',
          padding: '8px 16px',
          borderRadius: '0',
          letterSpacing: '0.1em',
          textDecoration: 'none',
          cursor: 'pointer',
          background: 'transparent',
        }}
      >
        {t('createButton')}
      </button>

      <UpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        reason="profile_cap"
        locale={locale}
      />
    </>
  )
}
