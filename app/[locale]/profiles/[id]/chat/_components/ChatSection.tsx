'use client'

import type { Conversation, Message } from '@/lib/actions/conversations'
import MessageList from './MessageList'
import ChatInput from './ChatInput'

export default function ChatSection({
  conversation,
  messages,
  profileId: _profileId,
}: {
  conversation: Conversation
  messages: Message[]
  profileId: string
}) {
  return (
    <div>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-main)',
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--zen-ink)',
          letterSpacing: '0.05em',
          margin: 0,
        }}>
          {/* Hardcoded until C6 i18n pass */}
          Conversation · 多轮问答
        </h2>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--zen-ink)',
          marginTop: '6px',
          marginBottom: 0,
        }}>
          Continuing conversation about your chart.
        </p>
      </div>

      <div className="zen-result-card">
        {/* Conversation title strip — C3 will add history toggle + new button */}
        <div style={{
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--zen-gold-pale)',
        }}>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--zen-text-muted)',
            textTransform: 'uppercase',
          }}>
            {conversation.title}
          </span>
        </div>

        {/* Message thread */}
        <MessageList messages={messages} />

        {/* Input — simple flow layout (C5/C6 may sticky this) */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--zen-gold-pale)' }}>
          <ChatInput conversationId={conversation.id} />
        </div>
      </div>
    </div>
  )
}
