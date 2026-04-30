'use client';

import { useParams } from 'next/navigation';

const messages: Record<string, string> = {
  en: 'Loading',
  'zh-CN': '加载中',
  'zh-TW': '載入中',
};

export default function Loading() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const text = messages[locale] || messages.en;

  return (
    <div className="py-32 flex flex-col items-center justify-center gap-3">
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--zen-text-muted)',
        letterSpacing: '0.15em',
      }}>
        {text}
      </div>
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-[#BC2D2D] animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-[#BC2D2D] animate-pulse"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-[#BC2D2D] animate-pulse"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
