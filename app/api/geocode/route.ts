import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 })
  }

  const url = new URL('https://api.opencagedata.com/geocode/v1/json')
  url.searchParams.set('q', q)
  url.searchParams.set('key', process.env.OPENCAGE_API_KEY!)
  url.searchParams.set('limit', '5')
  url.searchParams.set('no_annotations', '0')
  url.searchParams.set('language', 'en')

  const res = await fetch(url.toString())
  if (!res.ok) {
    return NextResponse.json({ error: 'Geocoding service error' }, { status: res.status })
  }

  const data = await res.json()

  const results = (data.results ?? []).map((r: {
    formatted: string
    geometry: { lat: number; lng: number }
    annotations: { timezone: { offset_sec: number } }
  }) => ({
    label: r.formatted,
    lat: r.geometry.lat,
    lng: r.geometry.lng,
    tzOffsetSec: r.annotations.timezone.offset_sec,
  }))

  return NextResponse.json(results)
}
