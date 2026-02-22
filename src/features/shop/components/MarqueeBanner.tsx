import { shopConfig } from '../config'
import { MountainIcon } from './MountainIcon'

export function MarqueeBanner() {
  const messages = shopConfig.marqueeMessages
  const duplicated = [...messages, ...messages]

  return (
    <div className="bg-terra-500 text-white overflow-hidden select-none">
      <div className="flex animate-marquee whitespace-nowrap py-2.5">
        {duplicated.map((msg, i) => (
          <span key={i} className="flex items-center gap-3 mx-6 text-body-xs font-medium uppercase tracking-widest">
            {msg.text}
            <MountainIcon className="w-3.5 h-3.5 opacity-60" />
          </span>
        ))}
      </div>
    </div>
  )
}
