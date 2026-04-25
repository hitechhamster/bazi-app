'use client'

import { useTranslations } from 'next-intl'
import type { ConversationListItem } from '@/lib/actions/conversations'
import ConversationListItemComponent from './ConversationListItem'

export default function ConversationListPanel({
  conversations,
  currentId,
  profileId,
}: {
  conversations: ConversationListItem[]
  currentId: string
  profileId: string
}) {
  const t = useTranslations('chat')

  if (conversations.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        background: 'var(--zen-paper)',
        border: '1px solid var(--zen-gold-pale)',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontStyle: 'italic',
          color: '#888',
          margin: 0,
        }}>
          {t('noConversations')}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--zen-paper)',
      border: '1px solid var(--zen-gold-pale)',
      maxHeight: '400px',
      overflowY: 'auto',
    }}>
      {conversations.map((c, i) => (
        <div
          key={c.id}
          style={{
            borderTop: i === 0 ? 'none' : '1px solid var(--zen-gold-pale)',
          }}
        >
          <ConversationListItemComponent
            conversation={c}
            isCurrent={c.id === currentId}
            profileId={profileId}
          />
        </div>
      ))}
    </div>
  )
}
