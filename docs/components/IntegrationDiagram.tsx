import { useId } from 'react'

/**
 * The config holds the logic; `fieldMapping` adapters connect it to a UI
 * library, whose own props the config passes. Colors come from the docs theme
 * variables, so the diagram follows light and dark mode.
 */
const libs = ['Mantine', 'shadcn/ui', 'Ant Design', 'Material UI', '+ 7 more']
const logic = ['labels · i18n', 'rules', 'JSON conditions', 'computed values', 'props (typed)']

const text = 'var(--rp-c-text-1)'
const muted = 'var(--rp-c-text-2)'
const brand = 'var(--rp-c-brand)'
const line = 'var(--rp-c-divider)'
const soft = 'var(--rp-c-bg-soft)'

export default function IntegrationDiagram() {
  const arrow = useId()
  const rowY = (i: number) => 56 + i * 46
  return (
    <svg
      viewBox="0 0 720 350"
      role="img"
      aria-label="A form config (labels, rules, conditions, computed values, typed props) connected through fieldMapping adapters to eleven UI libraries"
      style={{ width: '100%', height: 'auto', maxWidth: 760, margin: '16px 0' }}
      fontFamily="inherit"
    >
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={muted} />
        </marker>
      </defs>

      {/* shared config: the logic */}
      <rect x="12" y="16" width="260" height="290" rx="14" fill={soft} stroke={brand} strokeWidth="2" />
      <text x="142" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill={text}>
        config
      </text>
      {logic.map((item, i) => (
        <g key={item}>
          <rect x="28" y={rowY(i) + 4} width="228" height="36" rx="8" fill="none" stroke={line} />
          <text x="142" y={rowY(i) + 28} textAnchor="middle" fontSize="16" fill={text}>
            {item}
          </text>
        </g>
      ))}

      {/* fieldMapping: adapters + config with native props */}
      <rect x="322" y="16" width="126" height="290" rx="14" fill="none" stroke={line} strokeDasharray="5 4" />
      <text x="385" y="44" textAnchor="middle" fontSize="17" fontWeight="700" fill={text}>
        fieldMapping
      </text>
      <text x="385" y="64" textAnchor="middle" fontSize="14" fill={muted}>
        fields.tsx
      </text>
      <text x="385" y="146" textAnchor="middle" fontSize="14" fill={muted}>
        useField()
      </text>
      <text x="385" y="166" textAnchor="middle" fontSize="14" fill={muted}>
        → library
      </text>
      <text x="385" y="186" textAnchor="middle" fontSize="14" fill={muted}>
        components
      </text>

      <line x1="276" y1="161" x2="316" y2="161" stroke={muted} strokeWidth="2" markerEnd={`url(#${arrow})`} />

      {/* libraries */}
      {libs.map((lib, i) => {
        const y = 22 + i * 58
        return (
          <g key={lib}>
            <line x1="452" y1="161" x2="498" y2={y + 20} stroke={line} strokeWidth="1.5" markerEnd={`url(#${arrow})`} />
            <rect x="502" y={y} width="206" height="40" rx="8" fill={soft} stroke={line} />
            <text x="605" y={y + 26} textAnchor="middle" fontSize="16" fill={text}>
              {lib}
            </text>
          </g>
        )
      })}

      <text x="142" y="334" textAnchor="middle" fontSize="15" fontWeight="600" fill={brand}>
        Logic: what the form does
      </text>
      <text x="515" y="334" textAnchor="middle" fontSize="15" fontWeight="600" fill={muted}>
        Per library: how it looks
      </text>
    </svg>
  )
}
