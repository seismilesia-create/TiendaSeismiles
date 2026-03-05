export function AndesDivider() {
  return (
    <div className="relative py-10 lg:py-14 bg-[#FAFAF8] overflow-hidden">
      {/* Mountain silhouette divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center gap-6">
          {/* Left line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-volcanic-900/15 to-volcanic-900/15" />

          {/* Center mountain icon */}
          <div className="relative flex flex-col items-center gap-2">
            <svg
              viewBox="0 0 120 40"
              fill="none"
              className="w-28 sm:w-36 h-auto text-volcanic-900/10"
            >
              {/* Mountain range silhouette */}
              <path
                d="M0 40 L15 18 L25 28 L40 8 L55 22 L60 14 L65 22 L80 8 L95 28 L105 18 L120 40Z"
                fill="currentColor"
              />
              <path
                d="M10 40 L30 20 L45 30 L60 12 L75 30 L90 20 L110 40Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Right line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-volcanic-900/15 to-volcanic-900/15" />
        </div>
      </div>
    </div>
  )
}
