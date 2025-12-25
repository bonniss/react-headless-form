export const webFormRoot =
  (
    nativeProps: Omit<
      React.FormHTMLAttributes<HTMLFormElement>,
      "onSubmit" | "children"
    > = {}
  ) =>
  ({ children, onSubmit }: any) =>
    (
      <form {...nativeProps} onSubmit={onSubmit}>
        {children}
      </form>
    )
