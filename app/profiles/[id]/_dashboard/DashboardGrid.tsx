// Dashboard 模块：main content grid — Stage 2 Batch 2A (mock data)
import type { MockData } from './mock-data'
import BirthMetaStrip from './BirthMetaStrip'
import DayMasterHero from './DayMasterHero'
import FourPillarsPanel from './FourPillarsPanel'
import FiveElementsRadar from './FiveElementsRadar'
import TenGodsDistribution from './TenGodsDistribution'
import SpecialPalacesStrip from './SpecialPalacesStrip'
import LuckCycleTimeline from './LuckCycleTimeline'
import CurrentLiuNianStrip from './CurrentLiuNianStrip'
import ChartReadingPanel from './ChartReadingPanel'

export default function DashboardGrid({ data }: { data: MockData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <BirthMetaStrip data={data} />
      <DayMasterHero data={data} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FourPillarsPanel data={data} />
        <FiveElementsRadar data={data} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <TenGodsDistribution data={data} />
        <SpecialPalacesStrip data={data} />
      </div>
      <LuckCycleTimeline data={data} />
      <CurrentLiuNianStrip data={data} />
      <ChartReadingPanel />
    </div>
  )
}
