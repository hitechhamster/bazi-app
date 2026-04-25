'use client'

import { useTranslations } from 'next-intl'
import type { Message } from '@/lib/actions/conversations'
import MessageItem from './MessageItem'

export default function MessageList({ messages }: { messages: Message[] }) {
  const t = useTranslations('chat')

  if (messages.length === 0) {
    return (
      <div style={{
        padding: '48px 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontStyle: 'italic',
          color: '#888',
          margin: 0,
        }}>
          {t('messageList.empty')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  )
}
