interface MountainIconProps {
  className?: string
}

export function MountainIcon({ className = 'w-5 h-5' }: MountainIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 21l4.5-9L17 21" />
      <path d="M2 21l6-10.5L13.5 21" />
      <path d="M14.5 21L18 13l5.5 8" />
      <path d="M6.5 12l1.5-2.5L9.5 12" />
    </svg>
  )
}
