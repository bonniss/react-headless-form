import {
  type Context,
  type FunctionComponent,
  type ReactNode,
  createContext,
  useContext,
} from "react";

const MISSING = Symbol("missing-provider");

export type ProviderContext<TValue> = Context<TValue | typeof MISSING>;

/*
 * Provider + consumer hook pairs are built from three calls so that each
 * module-level export is a single `/* @__PURE__ *\/` call: bundlers (esbuild
 * included) can then drop the ones an app does not import. A destructured
 * `const [useX, XProvider] = createProvider()` is kept by esbuild, because
 * array destructuring may run an iterator, and it pulled in the whole library
 * for apps that only import e.g. a react-hook-form re-export.
 */

export function createProviderContext<TValue>(): ProviderContext<TValue> {
  return createContext<TValue | typeof MISSING>(MISSING);
}

/** The Provider runs `useValue(defaultValue)` and shares the result. */
export function createProviderComponent<TParams, TValue>(
  context: ProviderContext<TValue>,
  useValue: (params: TParams) => TValue,
  name: string,
) {
  const Provider: FunctionComponent<{
    defaultValue: TParams;
    children?: ReactNode;
  }> = ({ defaultValue, children }) => (
    <context.Provider value={useValue(defaultValue)}>{children}</context.Provider>
  );
  Provider.displayName = name;
  return Provider;
}

/**
 * The consumer hook reads the context and throws `errorMessage` outside the
 * Provider, unless `{ optional: true }` is passed (then it returns undefined).
 */
export function createConsumerHook<TValue>(
  context: ProviderContext<TValue>,
  errorMessage: string,
) {
  function useProvidedValue(): TValue;
  function useProvidedValue(opts: { optional: true }): TValue | undefined;
  function useProvidedValue(opts?: { optional?: boolean }) {
    const value = useContext(context);
    if (value !== MISSING) return value;
    if (opts?.optional) return undefined;
    throw new Error(errorMessage);
  }
  return useProvidedValue;
}
