import {
  type FunctionComponent,
  type ReactNode,
  createContext,
  useContext,
} from "react";

const MISSING = Symbol("missing-provider");

/**
 * Turns a hook into a Provider + consumer hook pair.
 *
 * The Provider runs `useValue(defaultValue)` and shares the result through
 * context. The consumer hook reads it and throws `errorMessage` when called
 * outside the Provider, unless `{ optional: true }` is passed, in which case
 * it returns `undefined`.
 */
export function createProvider<TParams, TValue>(
  useValue: (params: TParams) => TValue,
  options: { name: string; errorMessage: string },
) {
  const Context = createContext<TValue | typeof MISSING>(MISSING);

  const Provider: FunctionComponent<{
    defaultValue: TParams;
    children?: ReactNode;
  }> = ({ defaultValue, children }) => (
    <Context.Provider value={useValue(defaultValue)}>
      {children}
    </Context.Provider>
  );
  Provider.displayName = options.name;

  function useProvidedValue(): TValue;
  function useProvidedValue(opts: { optional: true }): TValue | undefined;
  function useProvidedValue(opts?: { optional?: boolean }) {
    const value = useContext(Context);
    if (value !== MISSING) return value;
    if (opts?.optional) return undefined;
    throw new Error(options.errorMessage);
  }

  return [useProvidedValue, Provider] as const;
}
