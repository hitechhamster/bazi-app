'use client'

import type { Conversation, ConversationListItem, Message } from '@/lib/actions/conversations'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ChatInput from './ChatInput'

export default function ChatSection({
  conversation,
  allConversations,
  messages,
  profileId,
}: {
  conversation: Conversation
  allConversations: ConversationListItem[]
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
        {/* Header strip: title + New + History toggle */}
        <ChatHeader
          currentConversationId={conversation.id}
          currentTitle={conversation.title}
          allConversations={allConversations}
          profileId={profileId}
        />

        {/* Message thread */}
        <MessageList messages={messages} />

        {/* Input — simple flow layout (C5/C6 may sticky this) */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--zen-gold-pale)' }}>
          <ChatInput
            conversationId={conversation.id}
            profileId={profileId}
            turnCount={messages.reduce((max, m) => Math.max(max, m.turn_number), 0)}
          />
        </div>
      </div>
    </div>
  )
}
