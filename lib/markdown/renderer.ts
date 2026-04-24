export function renderBaziMarkdown(md: string): string {
  // Step 1: HTML escape
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Step 2: block-level processing
  const lines = escaped.split('\n')
  const parts: string[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      parts.push(`<p>${paragraphLines.join('<br>')}</p>`)
      paragraphLines = []
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      const lis = listItems.map(item => `<li>${item}</li>`).join('')
      parts.push(`<ul class="ai-bullet-list">${lis}</ul>`)
      listItems = []
    }
  }

  for (const line of lines) {
    // horizontal rule: swallow
    if (line.trim() === '---') {
      flushParagraph()
      flushList()
      continue
    }

    // ### heading (check before ##)
    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      parts.push(`<h3 class="ai-subsection-title">${line.slice(4)}</h3>`)
      continue
    }

    // ## heading
    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      const content = line.slice(3)
      const numbered = content.match(/^(\d+)\. (.+)$/)
      if (numbered) {
        parts.push(`<h2 class="ai-section-title"><span class="title-number">${numbered[1]}.</span> ${numbered[2]}</h2>`)
      } else {
        parts.push(`<h2 class="ai-section-title">${content}</h2>`)
      }
      continue
    }

    // list item
    if (line.startsWith('- ')) {
      flushParagraph()
      listItems.push(line.slice(2))
      continue
    }

    // empty line: close open blocks
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      continue
    }

    // plain text line
    flushList()
    paragraphLines.push(line)
  }

  // flush any remaining open blocks
  flushParagraph()
  flushList()

  let html = parts.join('\n')

  // Step 3: inline replacements
  html = html.replace(/\[\[(.+?)\]\]/g, '<span class="pro-term">$1</span>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<span class="ai-keyword">$1</span>')

  return html
}
