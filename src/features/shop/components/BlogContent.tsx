'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

// Only admins edit blog posts today, but sanitize anyway so a compromised
// admin account (or a future path that accepts user-submitted markdown)
// can't ship <script> tags or dangerous attributes to every reader.
// Starts from the hast-util-sanitize default schema, which already drops
// <script>, event handlers and javascript: URLs. We extend it just enough
// to keep the markdown features we actually use.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Preserve syntax-highlighter classnames on inline/block code.
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    // remark-gfm adds class="task-list-item" / "contains-task-list".
    li: [...(defaultSchema.attributes?.li ?? []), ['className']],
    ul: [...(defaultSchema.attributes?.ul ?? []), ['className']],
    input: [...(defaultSchema.attributes?.input ?? []), 'checked', 'disabled', 'type'],
  },
}

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-volcanic-900 prose-p:text-volcanic-600 prose-p:leading-relaxed prose-a:text-terra-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-volcanic-900 prose-blockquote:border-terra-500 prose-blockquote:text-volcanic-500 prose-li:text-volcanic-600 prose-img:rounded-xl prose-hr:border-sand-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
