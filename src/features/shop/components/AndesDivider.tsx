export function AndesDivider() {
  return (
    <div className="relative bg-background overflow-hidden -my-px">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-16 sm:h-20 lg:h-28"
      >
        {/* Back range — lighter, taller peaks */}
        <path
          d="M0,120 L0,95 Q30,80 60,88 Q100,60 140,72 Q180,50 220,62 Q260,35 310,52 Q350,28 400,45 Q440,22 490,38 Q530,18 580,32 Q620,12 670,28 Q710,8 760,24 Q800,15 850,30 Q890,20 940,35 Q980,25 1020,42 Q1060,30 1100,48 Q1140,38 1170,55 Q1190,65 1200,70 L1200,120Z"
          className="fill-volcanic-900/[0.04]"
        />
        {/* Front range — darker, closer foothills */}
        <path
          d="M0,120 L0,105 Q40,92 80,98 Q120,78 170,88 Q210,68 260,80 Q310,58 360,72 Q410,52 460,65 Q510,45 560,58 Q610,40 660,55 Q710,38 760,50 Q810,42 860,55 Q910,45 960,58 Q1010,48 1060,62 Q1100,55 1140,68 Q1170,75 1200,82 L1200,120Z"
          className="fill-volcanic-900/[0.08]"
        />
      </svg>
    </div>
  )
}
