'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { deleteProfile, updateProfile } from '../actions'

export interface ProfileListCardData {
  id: string
  name: string
  relation: string
  gender: string
  birth_date: string
  birth_city: string | null
  day_master: string
  day_master_element: string
  pillar_year: string
  pillar_month: string
  pillar_day: string
  pillar_hour: string | null
  five_elements: { wood: number; fire: number; earth: number; metal: number; water: number }
  luck_cycles: Array<{
    ganZhi: string
    startAge: number
    endAge: number
    startYear: number
    endYear: number
  }> | null
  base_report_status: string | null
}

function getCurrentDayun(luckCycles: ProfileListCardData['luck_cycles'] | null) {
  if (!luckCycles || luckCycles.length === 0) return null
  const year = new Date().getFullYear()
  return luckCycles.find(c =>
    c.ganZhi !== '' && c.startYear <= year && year <= c.endYear
  ) ?? null
}

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  done:                  { dot: 'var(--element-wood)', label: 'Reading ready' },
  generating:            { dot: 'var(--zen-gold)',     label: 'Generating...' },
  generating_structured: { dot: 'var(--zen-gold)',     label: 'Analyzing...' },
  generating_reading:    { dot: 'var(--zen-gold)',     label: 'Writing...' },
  error:                 { dot: 'var(--zen-red)',      label: 'Error' },
}
const STATUS_FALLBACK = { dot: 'var(--zen-border)', label: 'Pending' }

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '13px',
  color: 'var(--zen-ink)',
  background: 'var(--zen-paper-deep)',
  border: '0.5px solid var(--zen-border)',
  borderRadius: '0',
  padding: '4px 8px',
  outline: 'none',
  boxSizing: 'border-box',
}

// ── Shared sub-rows (pillars, meta, dayun+status) ─────────────────────────────

function PillarsRow({ pillars }: { pillars: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-seal)', fontSize: '14px', color: 'var(--zen-ink)', letterSpacing: '0.3em' }}>
      {pillars}
    </div>
  )
}

function MetaRow({ metaLine }: { metaLine: string }) {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {metaLine}
    </div>
  )
}

function DayunStatusRow({ currentDayun, status }: {
  currentDayun: ReturnType<typeof getCurrentDayun>
  status: { dot: string; label: string }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {currentDayun ? (
          <>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>当前</span>
            <span style={{ fontFamily: 'var(--font-seal)', fontSize: '12px', color: 'var(--zen-red)', fontWeight: 500 }}>{currentDayun.ganZhi}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>age {currentDayun.startAge}–{currentDayun.endAge}</span>
          </>
        ) : (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>尚未起运</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot, marginRight: '4px', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)' }}>{status.label}</span>
      </div>
    </div>
  )
}

function Avatar({ dayMaster }: { dayMaster: string }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: 'var(--zen-red)', color: 'white',
      fontFamily: 'var(--font-seal)', fontSize: '18px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {dayMaster}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileListCard({ data: p }: { data: ProfileListCardData }) {
  const tCommon = useTranslations('common')
  const tEdit = useTranslations('editProfile')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(p.name)
  const [editRelation, setEditRelation] = useState(p.relation)
  const [editError, setEditError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const yinYang = '甲丙戊庚壬'.includes(p.day_master) ? 'Yang' : 'Yin'
  const currentDayun = getCurrentDayun(p.luck_cycles)
  const status = STATUS_CONFIG[p.base_report_status ?? ''] ?? STATUS_FALLBACK
  const pillars = [p.pillar_year, p.pillar_month, p.pillar_day, p.pillar_hour ?? '—'].join(' ')
  const cityStr = p.birth_city ? ` · ${p.birth_city}` : ''
  const metaLine = `${yinYang} ${p.day_master_element} · ${p.birth_date}${cityStr}`

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProfile(p.id)
      if (!result.ok) {
        setDeleteError(result.error ?? 'Delete failed')
        setConfirmDelete(false)
      }
    })
  }

  function handleSave() {
    setEditError(null)
    startTransition(async () => {
      const result = await updateProfile(p.id, {
        name: editName,
        relation: editRelation,
      })
      if (!result.ok) {
        setEditError(result.error ?? 'Save failed')
      } else {
        setIsEditing(false)
      }
    })
  }

  function enterEdit() {
    setConfirmDelete(false)
    setDeleteError(null)
    setEditName(p.name)
    setEditRelation(p.relation)
    setEditError(null)
    setIsEditing(true)
  }

  return (
    <div className="profile-card-wrapper" style={{ position: 'relative' }}>

      {/* ── Floating action buttons ── */}
      {!confirmDelete && (
        <>
          {/* ✏ edit — hidden while already editing */}
          {!isEditing && (
            <button
              onClick={enterEdit}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--zen-ink)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--zen-text-muted)' }}
              style={{
                position: 'absolute', top: '6px', right: '32px',
                fontFamily: 'var(--font-ui)', fontSize: '14px',
                color: 'var(--zen-text-muted)', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '2px 6px', lineHeight: 1,
                transition: 'color 0.15s ease', zIndex: 2,
              }}
            >
              ✏
            </button>
          )}
          {/* × delete — always visible (even while editing, so user can jump straight to delete) */}
          <button
            onClick={() => { setIsEditing(false); setEditError(null); setConfirmDelete(true); setDeleteError(null) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--zen-red)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--zen-text-muted)' }}
            style={{
              position: 'absolute', top: '6px', right: '8px',
              fontFamily: 'var(--font-ui)', fontSize: '18px',
              color: 'var(--zen-text-muted)', background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '2px 6px', lineHeight: 1,
              transition: 'color 0.15s ease', zIndex: 2,
            }}
          >
            ×
          </button>
        </>
      )}

      {confirmDelete ? (

        /* ── Branch 1: Confirm delete ── */
        <div style={{
          background: 'rgba(188,45,45,0.06)',
          border: '0.5px solid var(--zen-red)',
          borderRadius: '0', padding: '14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '12px', minHeight: '110px',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--zen-ink)', textAlign: 'center', margin: 0 }}>
            {tEdit('deleteConfirm')}
          </p>
          {deleteError && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-red)', margin: 0 }}>
              {deleteError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={isPending}
              style={{ border: '1px solid var(--zen-red)', color: 'var(--zen-red)', padding: '4px 12px', background: 'transparent', borderRadius: '0', fontSize: '12px', fontFamily: 'var(--font-ui)', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.5 : 1 }}
            >
              {tCommon('delete')}
            </button>
            <button
              onClick={() => { setConfirmDelete(false); setDeleteError(null) }}
              disabled={isPending}
              style={{ border: '0.5px solid var(--zen-border)', color: 'var(--zen-text-muted)', padding: '4px 12px', background: 'transparent', borderRadius: '0', fontSize: '12px', fontFamily: 'var(--font-ui)', cursor: 'pointer' }}
            >
              {tCommon('cancel')}
            </button>
          </div>
        </div>

      ) : isEditing ? (

        /* ── Branch 2: Edit card ── */
        <div style={{
          background: 'var(--zen-paper)',
          border: '0.5px solid var(--zen-gold)',
          borderRadius: '0', padding: '14px',
          display: 'grid', gridTemplateColumns: 'auto 1fr',
          gap: '12px', alignItems: 'center',
        }}>
          <Avatar dayMaster={p.day_master} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            {/* Editable row: name / relation */}
            <div style={{ display: 'flex', gap: '6px', paddingRight: '32px' }}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder={tEdit('nameLabel')}
                maxLength={50}
                style={{ ...inputStyle, flex: '1 1 auto', minWidth: 0 }}
              />
              <input
                value={editRelation}
                onChange={e => setEditRelation(e.target.value)}
                placeholder={tEdit('relationLabel')}
                maxLength={20}
                style={{ ...inputStyle, flex: '0 1 90px', minWidth: 0 }}
              />
            </div>
            {/* Non-editable rows — shown so user sees the chart identity */}
            <PillarsRow pillars={pillars} />
            <MetaRow metaLine={metaLine} />
            <DayunStatusRow currentDayun={currentDayun} status={status} />
            {/* Save / Cancel */}
            {editError && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-red)', margin: 0 }}>
                {editError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={isPending}
                style={{ border: '1px solid var(--zen-gold)', color: '#854F0B', padding: '4px 12px', background: 'transparent', borderRadius: '0', fontSize: '12px', fontFamily: 'var(--font-ui)', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.5 : 1 }}
              >
                {tCommon('save')}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditError(null) }}
                disabled={isPending}
                style={{ border: '0.5px solid var(--zen-border)', color: 'var(--zen-text-muted)', padding: '4px 12px', background: 'transparent', borderRadius: '0', fontSize: '12px', fontFamily: 'var(--font-ui)', cursor: 'pointer' }}
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        </div>

      ) : (

        /* ── Branch 3: Idle card — entire card is a Link ── */
        <Link
          href={`/profiles/${p.id}`}
          style={{
            background: 'var(--zen-paper)',
            border: '0.5px solid var(--zen-border)',
            borderRadius: '0', padding: '14px',
            display: 'grid', gridTemplateColumns: 'auto 1fr',
            gap: '12px', alignItems: 'center',
            textDecoration: 'none', color: 'inherit', cursor: 'pointer',
          }}
        >
          <Avatar dayMaster={p.day_master} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            {/* Row 1: name + relation */}
            <div style={{ display: 'flex', alignItems: 'baseline', paddingRight: '56px' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', fontWeight: 500, color: 'var(--zen-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: '0 1 auto' }}>
                {p.name}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--zen-text-muted)', marginLeft: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                {p.relation}
              </span>
            </div>
            <PillarsRow pillars={pillars} />
            <MetaRow metaLine={metaLine} />
            <DayunStatusRow currentDayun={currentDayun} status={status} />
          </div>
        </Link>

      )}
    </div>
  )
}
