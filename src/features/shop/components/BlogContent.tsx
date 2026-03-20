'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BlogContentProps {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-volcanic-900 prose-p:text-volcanic-600 prose-p:leading-relaxed prose-a:text-terra-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-volcanic-900 prose-blockquote:border-terra-500 prose-blockquote:text-volcanic-500 prose-li:text-volcanic-600 prose-img:rounded-xl prose-hr:border-sand-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
