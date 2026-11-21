/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldValues } from "react-hook-form";

import type { BlueFormProps, ComponentMap, FormFieldConfig } from "@/types";
import FieldNode from "./FieldNode";

interface BlueFormEngineProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> extends Pick<BlueFormProps<TModel, TComponentMap>, "config"> {
  namespace?: string;
}

/**
 * Dispatcher for one config level: renders a memoized `FieldNode` per entry.
 *
 * The engine itself subscribes to nothing, so value changes never re-render a
 * whole level; each `FieldNode` tracks its own conditions.
 */
function BlueFormEngine<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
>({ config, namespace }: BlueFormEngineProps<TModel, TComponentMap>) {
  return (
    <>
      {Object.entries(config).map(([name, field]) => (
        <FieldNode
          key={namespace ? `${namespace}.${name}` : name}
          name={name}
          field={field as FormFieldConfig<any, any>}
          namespace={namespace}
        />
      ))}
    </>
  );
}

export default BlueFormEngine;
