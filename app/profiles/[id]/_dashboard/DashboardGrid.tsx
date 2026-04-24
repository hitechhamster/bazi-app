import type { MockData } from './mock-data'
import DayMasterHero from './DayMasterHero'
import FourPillarsPanel from './FourPillarsPanel'
import FiveElementsRadar from './FiveElementsRadar'
import TenGodsDistribution from './TenGodsDistribution'
import ChartReadingPanel from './ChartReadingPanel'
import SpecialPalacesStrip from './SpecialPalacesStrip'
import LuckCycleTimeline from './LuckCycleTimeline'
import CurrentLiuNianStrip from './CurrentLiuNianStrip'

import type { ReportStatus, ReportStructured } from '../actions'

interface Props {
  data: MockData
  profileId: string
  initialStatus: ReportStatus
  initialStructured: ReportStructured | null
}

export default function DashboardGrid({ data, profileId, initialStatus, initialStructured }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
      {/* Row 1: DayMasterHero | FourPillarsPanel */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px', alignItems: 'start' }}>
        <DayMasterHero data={data} />
        <FourPillarsPanel data={data} />
      </div>

      {/* Row 2: Radar + ChartReading side by side, equal height */}
      <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '6px', alignItems: 'start' }}>
        <FiveElementsRadar data={data} />
        <ChartReadingPanel
          data={data}
          profileId={profileId}
          initialStatus={initialStatus}
          initialStructured={initialStructured}
        />
      </div>
      {/* Row 2.5: TenGodsDistribution spans full width */}
      <TenGodsDistribution data={data} />

      {/* Row 3: SpecialPalacesStrip */}
      <SpecialPalacesStrip data={data} />

      {/* Row 4: LuckCycleTimeline */}
      <LuckCycleTimeline data={data} />

      {/* Row 5: CurrentLiuNianStrip */}
      <CurrentLiuNianStrip data={data} />
    </div>
  )
}
