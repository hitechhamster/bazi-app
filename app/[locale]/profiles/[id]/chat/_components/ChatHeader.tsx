'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createConversation } from '@/lib/actions/conversations'
import type { ConversationListItem } from '@/lib/actions/conversations'
import ConversationListPanel from './ConversationListPanel'

const actionButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '11px',
  letterSpacing: '0.05em',
  color: '#854F0B',
  background: 'var(--zen-paper-deep)',
  border: '1px solid var(--zen-gold-pale)',
  padding: '6px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
}

const actionButtonDisabledStyle: React.CSSProperties = {
  ...actionButtonStyle,
  color: 'var(--zen-text-muted)',
  cursor: 'default',
}

export default function ChatHeader({
  currentConversationId,
  currentTitle,
  allConversations,
  profileId,
}: {
  currentConversationId: string
  currentTitle: string
  allConversations: ConversationListItem[]
  profileId: string
}) {
  const router = useRouter()
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleNew() {
    if (creating) return
    setCreating(true)
    setCreateError(null)
    try {
      const result = await createConversation(profileId)
      if ('error' in result) {
        setCreateError(result.error)
      } else {
        router.push(`/profiles/${profileId}/chat/${result.conversationId}`)
      }
    } catch {
      setCreateError('Failed to create conversation.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Row 1: title + action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--zen-gold-pale)',
      }}>
        {/* Current conversation title */}
        <span style={{
          fontFamily: 'var(--font-main)',
          fontSize: '16px',
          color: '#1a1a1a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
          {currentTitle}
        </span>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleNew}
            disabled={creating}
            style={creating ? actionButtonDisabledStyle : actionButtonStyle}
          >
            {creating ? 'Creating…' : '+ New'}
          </button>

          <button
            onClick={() => setHistoryExpanded((v) => !v)}
            style={actionButtonStyle}
          >
            {historyExpanded ? '▲' : '▼'} History ({allConversations.length})
          </button>
        </div>
      </div>

      {/* Create error */}
      {createError && (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--zen-red)',
          margin: '6px 0 0',
        }}>
          {createError}
        </p>
      )}

      {/* Row 2: expandable history list */}
      {historyExpanded && (
        <div style={{ marginTop: '8px' }}>
          <ConversationListPanel
            conversations={allConversations}
            currentId={currentConversationId}
            profileId={profileId}
          />
        </div>
      )}
    </div>
  )
}
