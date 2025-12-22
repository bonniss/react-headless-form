import { useEffect, useMemo, useState } from "react"
import { FieldArrayWithId } from "react-hook-form"

function useArrayCollapseMap(
  fields: FieldArrayWithId[],
  defaultCollapsed = false
) {
  const initial = useMemo(
    () =>
      Object.fromEntries(fields.map((f) => [f.id, defaultCollapsed])) as Record<
        string,
        boolean
      >,
    [fields, defaultCollapsed]
  )

  const [collapseMap, setCollapseMap] = useState(initial)

  useEffect(() => {
    setCollapseMap((prev) => {
      const next: Record<string, boolean> = {}

      for (const field of fields) {
        next[field.id] = prev[field.id] ?? defaultCollapsed
      }

      return next
    })
  }, [fields, defaultCollapsed])

  const toggle = (id: string) =>
    setCollapseMap((prev) => ({ ...prev, [id]: !prev[id] }))

  const collapse = (id: string) =>
    setCollapseMap((prev) => ({ ...prev, [id]: true }))

  const expand = (id: string) =>
    setCollapseMap((prev) => ({ ...prev, [id]: false }))

  const setAll = (collapsed: boolean) =>
    setCollapseMap(Object.fromEntries(fields.map((f) => [f.id, collapsed])))

  const toggleAll = () =>
    setCollapseMap((prev) =>
      Object.fromEntries(fields.map((f) => [f.id, !prev[f.id]]))
    )

  return {
    collapseMap,
    toggle,
    expand,
    collapse,
    toggleAll,
    expandAll: () => setAll(false),
    collapseAll: () => setAll(true),
  }
}

export default useArrayCollapseMap
