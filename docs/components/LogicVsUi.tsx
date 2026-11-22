// Counted from the demo sources at build time, so the table cannot drift.
import animalIslandConfig from '../integrations/animal-island/config.tsx?raw'
import animalIslandFields from '../integrations/animal-island/fields.tsx?raw'
import antdConfig from '../integrations/antd/config.tsx?raw'
import antdFields from '../integrations/antd/fields.tsx?raw'
import mantineConfig from '../integrations/mantine/config.tsx?raw'
import mantineFields from '../integrations/mantine/fields.tsx?raw'
import muiConfig from '../integrations/mui/config.tsx?raw'
import muiFields from '../integrations/mui/fields.tsx?raw'
import shadcnConfig from '../integrations/shadcn/config.tsx?raw'
import shadcnFields from '../integrations/shadcn/fields.tsx?raw'
import logic from '../integrations/shared/logic.ts?raw'

const lines = (source: string) => source.trimEnd().split('\n').length
/** Form-logic declarations: validation rules, conditions and computed values. */
const logicCount = (source: string) => (source.match(/\b(rules|visible|disabled|compute):/g) ?? []).length

const rows: [file: string, usedBy: string, ...sources: string[]][] = [
  ['shared/logic.ts', 'all libraries', logic],
  ['mantine/', 'Mantine', mantineFields, mantineConfig],
  ['shadcn/', 'shadcn/ui', shadcnFields, shadcnConfig],
  ['antd/', 'Ant Design', antdFields, antdConfig],
  ['mui/', 'Material UI', muiFields, muiConfig],
  ['animal-island/', 'animal-island-ui', animalIslandFields, animalIslandConfig],
]

export default function LogicVsUi() {
  return (
    <table>
      <thead>
        <tr>
          <th>Files</th>
          <th>Used by</th>
          <th>Lines</th>
          <th>Rules, conditions, computes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([file, usedBy, ...sources]) => (
          <tr key={file}>
            <td>
              <code>{file}</code>
              {sources.length > 1 && ' fields.tsx + config.tsx'}
            </td>
            <td>{usedBy}</td>
            <td>{sources.map(lines).join(' + ')}</td>
            <td>
              <strong>{sources.reduce((sum, source) => sum + logicCount(source), 0)}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
