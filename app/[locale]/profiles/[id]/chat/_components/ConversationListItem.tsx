'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteConversation } from '@/lib/actions/conversations'
import type { ConversationListItem as ConversationListItemType } from '@/lib/actions/conversations'

function formatConversationDate(isoString: string, locale: string): string {
  const intlLocale =
    locale === 'zh-CN' ? 'zh-Hans-CN' :
    locale === 'zh-TW' ? 'zh-Hant-TW' :
    'en-US'
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoString))
}

export default function ConversationListItem({
  conversation,
  isCurrent,
  profileId,
}: {
  conversation: ConversationListItemType
  isCurrent: boolean
  profileId: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const turns = Math.floor(conversation.message_count / 2)
  const dateStr = formatConversationDate(conversation.updated_at, conversation.locale)

  function handleRowClick() {
    if (isCurrent) return
    router.push(`/profiles/${profileId}/chat/${conversation.id}`)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteConversation(conversation.id)
      if ('error' in result) {
        setDeleteError(result.error)
        setDeleting(false)
        setConfirming(false)
      } else {
        // Success — refresh to remove the deleted row from the list
        router.refresh()
      }
    } catch {
      setDeleteError('Delete failed. Please try again.')
      setDeleting(false)
      setConfirming(false)
    }
  }

  const rowBg = isCurrent
    ? 'var(--zen-paper-deep)'
    : hovered
    ? 'var(--zen-gold-pale)'
    : 'transparent'

  return (
    <div
      onClick={handleRowClick}
      onMouseEnter={() => !isCurrent && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 16px',
        background: rowBg,
        cursor: isCurrent ? 'default' : 'pointer',
        transition: 'background 0.1s ease',
      }}
    >
      {/* Row 1: title + current badge + delete */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-main)',
            fontSize: '14px',
            color: '#1a1a1a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {conversation.title}
          </span>
          {isCurrent && (
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#854F0B',
              border: '1px solid var(--zen-gold-pale)',
              padding: '1px 6px',
              flexShrink: 0,
            }}>
              Current
            </span>
          )}
        </div>

        {/* Delete controls — only shown when not current */}
        {!isCurrent && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flexShrink: 0 }}
          >
            {!confirming && (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: '#854F0B',
                  textDecoration: 'underline',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            )}
            {confirming && !deleting && (
              <span style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                <button
                  onClick={handleDelete}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--zen-red)',
                    textDecoration: 'underline',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  Confirm delete
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--zen-text-muted)',
                    textDecoration: 'underline',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </span>
            )}
            {deleting && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>
                Deleting…
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row 2: date + turn count */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.02em',
      }}>
        {dateStr} · {turns} {turns === 1 ? 'turn' : 'turns'}
      </div>

      {/* Inline delete error */}
      {deleteError && (
        <div style={{
          marginTop: '4px',
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-red)',
        }}>
          {deleteError}
        </div>
      )}
    </div>
  )
}
