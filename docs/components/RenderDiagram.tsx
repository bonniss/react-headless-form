import type { ReactNode } from 'react'

/**
 * What `render` draws (dashed: your render output) versus what the library
 * hands it (brand: `self`, `children`, `renderItem`), per field kind. One small
 * SVG per kind, shown next to that kind's explanation. Colors come
 * from the docs theme variables (light and dark).
 */
const text = 'var(--rp-c-text-1)'
const muted = 'var(--rp-c-text-2)'
const brand = 'var(--rp-c-brand)'
const line = 'var(--rp-c-divider)'
const soft = 'var(--rp-c-bg-soft)'

const W = 180
const H = 220

function Yours({ y = 34, h = H - 44 }: { y?: number; h?: number }) {
  return <rect x="8" y={y} width={W - 16} height={h} rx="10" fill="none" stroke={muted} strokeDasharray="5 4" />
}

function Lib({ y, h, label, sub }: { y: number; h: number; label: string; sub?: string }) {
  return (
    <g>
      <rect x="22" y={y} width={W - 44} height={h} rx="8" fill={soft} stroke={brand} strokeWidth="2" />
      <text
        x={W / 2}
        y={y + (sub ? h / 2 - 2 : h / 2 + 5)}
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill={brand}
      >
        {label}
      </text>
      {sub && (
        <text x={W / 2} y={y + h / 2 + 15} textAnchor="middle" fontSize="11" fill={muted}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Note({ y, children, color = muted }: { y: number; children: ReactNode; color?: string }) {
  return (
    <text x="24" y={y} fontSize="12" fill={color}>
      {children}
    </text>
  )
}

function Panel({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}: ${caption}`}
        style={{ width: '100%', height: 'auto' }}
      >
        <text
          x={W / 2}
          y="20"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill={text}
          fontFamily="var(--rp-font-family-mono, monospace)"
        >
          {title}
        </text>
        {children}
      </svg>
      <figcaption style={{ fontSize: 13, color: muted, textAlign: 'center', lineHeight: 1.4 }}>{caption}</figcaption>
    </figure>
  )
}

const Input = ({ y }: { y: number }) => (
  <rect x="24" y={y} width={W - 48} height="22" rx="5" fill="none" stroke={line} strokeWidth="1.5" />
)

const panels = {
  inline: (
    <Panel title="inline" caption="render draws the whole field from its props">
      <Yours />
      <Note y={60} color={text}>
        label *
      </Note>
      <Input y={70} />
      <Note y={112} color="#dc2626">
        errorMessage
      </Note>
      <text x={W / 2} y="150" textAnchor="middle" fontSize="11" fill={brand}>
        {'({ value, onChange,'}
      </text>
      <text x={W / 2} y="166" textAnchor="middle" fontSize="11" fill={brand}>
        {'errorMessage, … })'}
      </text>
      <text x={W / 2} y="196" textAnchor="middle" fontSize="11" fill={muted}>
        only values, no UI
      </text>
    </Panel>
  ),
  mapped: (
    <Panel title="text (mapped)" caption="render wraps self, the mapped component">
      <Yours />
      <Note y={60} color={text}>
        tooltip · icon · hint
      </Note>
      <Lib y={76} h={74} label="{self}" sub="fieldMapping.text" />
      <Note y={178}>extra markup</Note>
    </Panel>
  ),
  section: (
    <Panel title="section" caption="render wraps children, the inner fields">
      <Yours />
      <Note y={60} color={text}>
        {'<legend>{label}'}
      </Note>
      <Lib y={72} h={120} label="{children}" />
      <rect x="34" y="150" width={W - 68} height="12" rx="3" fill="none" stroke={line} />
      <rect x="34" y="168" width={W - 68} height="12" rx="3" fill="none" stroke={line} />
    </Panel>
  ),
  array: (
    <Panel title="array" caption="render is the shell; rows come from renderItem">
      <Yours />
      <Note y={60} color={text}>
        {'<legend>{label}'}
      </Note>
      <Lib y={70} h={34} label="renderItem(0)" />
      <Lib y={110} h={34} label="renderItem(1)" />
      <rect x="22" y="152" width="70" height="22" rx="5" fill="none" stroke={muted} strokeDasharray="3 3" />
      <text x="57" y="167" textAnchor="middle" fontSize="11" fill={text}>
        + Add
      </text>
      <Note y={192} color="#dc2626">
        errorMessage
      </Note>
    </Panel>
  ),
}

/** One panel per field kind, placed in that kind's section of the page. */
export default function RenderDiagram({ kind }: { kind: keyof typeof panels }) {
  return (
    <div style={{ margin: '16px auto', maxWidth: 260 }}>
      {panels[kind]}
      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: 13,
          color: muted,
          marginTop: 8,
        }}
      >
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 22,
              height: 12,
              border: `1.5px dashed ${muted}`,
              borderRadius: 3,
              marginRight: 6,
              verticalAlign: -1,
            }}
          />
          your <code>render</code> output
        </span>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 22,
              height: 12,
              border: `2px solid ${brand}`,
              background: soft,
              borderRadius: 3,
              marginRight: 6,
              verticalAlign: -1,
            }}
          />
          handed to it by the library
        </span>
      </div>
    </div>
  )
}
