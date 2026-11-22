// Counted from the demo sources at build time, so the table cannot drift.
import animalIsland from '../integrations/animal-island/fields.tsx?raw'
import antd from '../integrations/antd/fields.tsx?raw'
import mantine from '../integrations/mantine/fields.tsx?raw'
import mui from '../integrations/mui/fields.tsx?raw'
import shadcn from '../integrations/shadcn/fields.tsx?raw'
import config from '../integrations/shared/config.tsx?raw'

const lines = (source: string) => source.trimEnd().split('\n').length
/** Form-logic declarations: validation rules, conditions and computed values. */
const logic = (source: string) => (source.match(/\b(rules|visible|disabled|compute):/g) ?? []).length

const rows: [string, string, string][] = [
  ['shared/config.tsx', 'all libraries', config],
  ['mantine/fields.tsx', 'Mantine', mantine],
  ['shadcn/fields.tsx', 'shadcn/ui', shadcn],
  ['antd/fields.tsx', 'Ant Design', antd],
  ['mui/fields.tsx', 'Material UI', mui],
  ['animal-island/fields.tsx', 'animal-island-ui', animalIsland],
]

export default function LogicVsUi() {
  return (
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Used by</th>
          <th>Lines</th>
          <th>Rules, conditions, computes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([file, usedBy, source]) => (
          <tr key={file}>
            <td>
              <code>{file}</code>
            </td>
            <td>{usedBy}</td>
            <td>{lines(source)}</td>
            <td>
              <strong>{logic(source)}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
