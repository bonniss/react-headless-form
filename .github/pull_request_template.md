## What & why

<!-- Short description. Link issues. -->

## Core guarantees (CONTRIBUTING.md)

- [ ] `pnpm verify` passes locally, and the **`ci ok`** check is green on this PR
- [ ] No check was weakened (budget, allowlists, `@ts-expect-error`, render/mount assertions, G8 export snapshot). If one was, explain why below.
- [ ] New config or props have positive and negative type tests in `test/types/consumer/`
- [ ] Behavior touching rendering or subscriptions has a guarantee test
- [ ] Breaking change? Deprecated first, and the commit is marked `!` / `BREAKING CHANGE:`
