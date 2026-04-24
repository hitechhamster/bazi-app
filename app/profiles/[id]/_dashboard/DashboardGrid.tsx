import type { MockData } from './mock-data'
import DayMasterHero from './DayMasterHero'
import FourPillarsPanel from './FourPillarsPanel'
import FiveElementsRadar from './FiveElementsRadar'
import TenGodsDistribution from './TenGodsDistribution'
import ChartReadingPanel from './ChartReadingPanel'
import SpecialPalacesStrip from './SpecialPalacesStrip'
import LuckCycleTimeline from './LuckCycleTimeline'
import CurrentLiuNianStrip from './CurrentLiuNianStrip'

export default function DashboardGrid({ data }: { data: MockData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
      {/* Row 1: DayMasterHero | FourPillarsPanel */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px', alignItems: 'stretch' }}>
        <DayMasterHero data={data} />
        <FourPillarsPanel data={data} />
      </div>

      {/* Row 2: FiveElementsRadar | ChartReadingPanel + TenGodsDistribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '6px', alignItems: 'stretch' }}>
        <FiveElementsRadar data={data} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <ChartReadingPanel data={data} />
          <TenGodsDistribution data={data} />
        </div>
      </div>

      {/* Row 3: SpecialPalacesStrip */}
      <SpecialPalacesStrip data={data} />

      {/* Row 4: LuckCycleTimeline */}
      <LuckCycleTimeline data={data} />

      {/* Row 5: CurrentLiuNianStrip */}
      <CurrentLiuNianStrip data={data} />
    </div>
  )
}
