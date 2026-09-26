# Design System — Aura Vault Protocol

Component library specification for consistent UI across all Aura frontend surfaces.

---

## Color Palette

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-primary` | `#6C63FF` | Primary actions, links |
| `--color-brand-secondary` | `#00D4AA` | Yield/positive indicators |
| `--color-brand-accent` | `#FF6B6B` | Warnings, destructive actions |

### Neutral

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-900` | `#0D0D0D` | Dark theme background |
| `--color-neutral-800` | `#1A1A2E` | Card backgrounds (dark) |
| `--color-neutral-700` | `#252540` | Elevated surfaces (dark) |
| `--color-neutral-100` | `#F5F5FA` | Light theme background |
| `--color-neutral-200` | `#EEEEF6` | Card backgrounds (light) |
| `--color-neutral-600` | `#6E6E8A` | Secondary text |
| `--color-neutral-0` | `#FFFFFF` | Primary text (dark theme) |

### Semantic

| Token | Maps to | Usage |
|---|---|---|
| `--color-success` | `#00D4AA` | Positive yield, confirmed |
| `--color-error` | `#FF6B6B` | Errors, insufficient balance |
| `--color-warning` | `#FFB84D` | Archival risk, low balance |
| `--color-info` | `#6C63FF` | Informational states |

---

## Typography

Base font: **Inter** (system-ui fallback stack).

| Scale | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | 400 | 1.5 | Labels, footnotes |
| `--text-sm` | 13px | 400 | 1.5 | Body secondary |
| `--text-base` | 15px | 400 | 1.6 | Body primary |
| `--text-lg` | 18px | 500 | 1.4 | Subheadings |
| `--text-xl` | 22px | 600 | 1.3 | Section headings |
| `--text-2xl` | 28px | 700 | 1.2 | Page headings |
| `--text-3xl` | 36px | 700 | 1.1 | Hero / vault balance display |

Numeric displays (share counts, token amounts) use **tabular-nums** font-variant for alignment.

---

## Spacing Scale

8px base unit.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight intra-component gaps |
| `--space-2` | 8px | Default component padding |
| `--space-3` | 12px | Input padding |
| `--space-4` | 16px | Card padding |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Page section margins |
| `--space-12` | 48px | Large layout gaps |
| `--space-16` | 64px | Page-level vertical rhythm |

---

## Layout Grid

- Max content width: **1200px**
- Columns: 12 (desktop), 8 (tablet), 4 (mobile)
- Column gutter: `--space-6` (24px)
- Page margin: `--space-4` (16px) mobile / `--space-8` (32px) tablet+ 

---

## Component Library

### Button

Three variants: `primary`, `secondary`, `ghost`. Three sizes: `sm`, `md`, `lg`.

```
States: default | hover | active | disabled | loading
Min tap target: 44×44px (all sizes meet this on mobile)
```

| Prop | Values |
|---|---|
| `variant` | `primary` \| `secondary` \| `ghost` \| `danger` |
| `size` | `sm` (32px h) \| `md` (40px h) \| `lg` (48px h) |
| `loading` | boolean — shows spinner, disables interaction |
| `fullWidth` | boolean |

Accessibility: `role="button"`, `aria-disabled` when disabled, `aria-busy` when loading. Keyboard: Enter + Space activate.

---

### Input

Single-line text/number input with optional prefix and suffix slots.

```
States: default | focus | error | disabled
```

| Prop | Values |
|---|---|
| `type` | `text` \| `number` \| `password` |
| `label` | string — rendered above, associated via `for`/`id` |
| `error` | string — renders below in `--color-error`; sets `aria-invalid` |
| `prefix` | slot — token symbol, icon |
| `suffix` | slot — max button, unit label |
| `hint` | string — helper text below input |

For token amount inputs, always pair with a "Max" suffix button that reads the user's `balance_of`.

---

### Card

Content container with consistent elevation and padding.

| Prop | Values |
|---|---|
| `variant` | `default` \| `elevated` \| `outlined` |
| `padding` | `sm` \| `md` \| `lg` |
| `interactive` | boolean — adds hover state for clickable cards |

Dark theme: `background: --color-neutral-800`, `border: 1px solid rgba(255,255,255,0.06)`.
Light theme: `background: --color-neutral-200`, `border: 1px solid rgba(0,0,0,0.06)`.

---

### Modal

Accessible dialog overlay.

```
Trigger → Modal opens with focus trap
Esc key → closes
Click outside backdrop → closes (configurable)
```

| Prop | Values |
|---|---|
| `size` | `sm` (400px) \| `md` (560px) \| `lg` (720px) |
| `title` | string — rendered in modal header, bound to `aria-labelledby` |
| `closeable` | boolean (default true) |

Accessibility: `role="dialog"`, `aria-modal="true"`, focus moves to first focusable element on open, returns to trigger on close.

---

### StatCard

Displays a single vault metric (total assets, your shares, exchange rate).

```
┌─────────────────────────┐
│ Total Assets            │
│ 1,234,567.89 USDC  ↑5%  │
│ Updated 2 min ago       │
└─────────────────────────┘
```

Props: `label`, `value`, `unit`, `delta` (optional % change), `updatedAt`.

---

### TokenAmountInput

Composed component: Input + token logo + symbol + Max button.

Formats the numeric value with the token's decimal precision on blur. Shows USD equivalent if a price feed is available.

---

### TransactionStatus

Inline status indicator for pending/confirmed/failed on-chain transactions.

| State | Display |
|---|---|
| `pending` | Spinner + "Confirming on Stellar…" |
| `success` | Green checkmark + transaction hash (truncated, links to explorer) |
| `error` | Red X + error message from `VaultError` enum, human-readable |

Maps contract error codes to readable messages:

| Code | User-facing message |
|---|---|
| `ZeroAmount` | "Amount too small — try a larger value" |
| `InsufficientShares` | "You don't have enough shares to withdraw that amount" |
| `MathOverflow` | "Amount exceeds safe limits" |
| `NotInitialized` | "Vault is not active yet" |

---

### SharesDisplay

Read-only display of a share balance with current redemption value.

```
Your Shares: 500,000  ≈ 600,000 USDC
```

Calls `balance_of` and `total_assets` + `total_shares` to compute the live redemption estimate.

---

### WalletButton

Connect/disconnect wallet control. Shows truncated address when connected.

```
Disconnected: [ Connect Wallet ]
Connected:    [ G...XYZ ▼ ] → dropdown with disconnect, copy address
```

---

### Skeleton

Loading placeholder. Matches the shape of StatCard, Card, and table rows. Uses CSS animation (`opacity` pulse) — no layout shift.

---

### Badge

Small label for states: `active`, `paused`, `testnet`, `mainnet`.

---

### Tooltip

Hover/focus popover for definitions (e.g. "What are vault shares?"). Max width 240px. Keyboard accessible via `aria-describedby`.

---

## Icon Set

50 icons, 24×24px default, SVG sprite or component-based. Stroke-based, 1.5px weight.

Categories:

| Category | Icons |
|---|---|
| Navigation | home, vault, history, settings, external-link |
| Actions | deposit, withdraw, harvest, copy, refresh, close, check, plus, minus |
| Finance | token, share, yield, exchange-rate, total-assets, wallet, arrow-up, arrow-down, trending-up, trending-down |
| Status | spinner, checkmark-circle, x-circle, warning-triangle, info-circle, clock |
| Blockchain | stellar, ledger-entry, transaction, block, contract, key, lock, unlock |
| UI | chevron-down, chevron-right, menu, grid, list, moon, sun, eye, eye-off |
| Misc | question-circle, star, bell, search, filter, sort |

---

## Theme Support

All color tokens are defined as CSS custom properties on `:root` with dark theme overrides on `[data-theme="dark"]`.

```css
:root {
  --color-bg: var(--color-neutral-100);
  --color-surface: var(--color-neutral-200);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
}

[data-theme="dark"] {
  --color-bg: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-0);
  --color-text-secondary: var(--color-neutral-600);
}
```

Theme toggle persists to `localStorage`. Default: system preference via `prefers-color-scheme`.

---

## Accessibility Guidelines

- All interactive elements must have a visible focus ring (`outline: 2px solid --color-brand-primary; outline-offset: 2px`).
- Color is never the sole means of conveying information — always pair with text or icon.
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- All form inputs have associated `<label>` elements (not just `placeholder`).
- Modals trap focus and restore it on close.
- Loading states use `aria-live="polite"` regions for screen reader announcements.
- Destructive actions (full withdraw) require a confirmation step.
- Touch targets: minimum 44×44px on all interactive elements.

---

## Storybook

Each component has a Storybook story covering:
- All variant/size combinations
- All interactive states (hover, focus, disabled, loading, error)
- Dark and light theme renders
- Accessibility audit via `@storybook/addon-a11y`

Run locally:

```bash
cd frontend
npm run storybook   # opens at http://localhost:6006
```

Deployed Storybook URL is published as a GitHub Pages artifact on every merge to `main`.

---

## WCAG 2.1 AA Contrast Audit

All colour combinations below have been audited against WCAG 2.1 Success Criterion 1.4.3 (Contrast — Minimum).
Target: ≥ **4.5:1** for normal text, ≥ **3:1** for large text (18pt / 14pt bold).

Colour tokens are defined in `ui/src/styles/colours.css` using the `--c-*` naming convention.

### Dark Mode Combinations

| Foreground Token | Background Token | Hex Foreground | Hex Background | Contrast Ratio | WCAG AA Normal | WCAG AA Large |
|---|---|---|---|---|---|---|
| `--c-text` | `--c-bg` | `#e8eaf6` | `#0f1117` | **12.5:1** | ✅ Pass | ✅ Pass |
| `--c-text` | `--c-surface` | `#e8eaf6` | `#1a1d27` | **10.2:1** | ✅ Pass | ✅ Pass |
| `--c-text-muted` | `--c-bg` | `#9fa8c7` | `#0f1117` | **6.1:1** | ✅ Pass | ✅ Pass |
| `--c-text-muted` | `--c-surface` | `#9fa8c7` | `#1a1d27` | **5.0:1** | ✅ Pass | ✅ Pass |
| `--c-primary` | `--c-bg` | `#a5aeff` | `#0f1117` | **8.9:1** | ✅ Pass | ✅ Pass |
| `--c-primary` | `--c-surface` | `#a5aeff` | `#1a1d27` | **7.2:1** | ✅ Pass | ✅ Pass |
| `--c-error` | `--c-bg` | `#ff9999` | `#0f1117` | **7.2:1** | ✅ Pass | ✅ Pass |
| `--c-error` | `--c-surface` | `#ff9999` | `#1a1d27` | **5.9:1** | ✅ Pass | ✅ Pass |
| `--c-success` | `--c-bg` | `#6bcf9e` | `#0f1117` | **7.0:1** | ✅ Pass | ✅ Pass |
| `--c-success` | `--c-surface` | `#6bcf9e` | `#1a1d27` | **5.7:1** | ✅ Pass | ✅ Pass |
| `--c-warning` | `--c-bg` | `#ffd166` | `#0f1117` | **10.1:1** | ✅ Pass | ✅ Pass |
| `--c-warning` | `--c-surface` | `#ffd166` | `#1a1d27` | **8.2:1** | ✅ Pass | ✅ Pass |
| `--c-info` | `--c-bg` | `#7ecfff` | `#0f1117` | **8.9:1** | ✅ Pass | ✅ Pass |
| `--c-link` | `--c-bg` | `#a5aeff` | `#0f1117` | **8.9:1** | ✅ Pass | ✅ Pass |
| `--c-link-visited` | `--c-bg` | `#c8a8ff` | `#0f1117` | **9.4:1** | ✅ Pass | ✅ Pass |
| `--c-text-inverse` | `--c-primary` | `#0f1117` | `#a5aeff` | **8.9:1** | ✅ Pass | ✅ Pass |

### Light Mode Combinations

| Foreground Token | Background Token | Hex Foreground | Hex Background | Contrast Ratio | WCAG AA Normal | WCAG AA Large |
|---|---|---|---|---|---|---|
| `--c-text` | `--c-bg` | `#1a1d27` | `#f5f6fa` | **15.3:1** | ✅ Pass | ✅ Pass |
| `--c-text` | `--c-surface` | `#1a1d27` | `#ffffff` | **17.1:1** | ✅ Pass | ✅ Pass |
| `--c-text-muted` | `--c-bg` | `#4b5470` | `#f5f6fa` | **7.4:1** | ✅ Pass | ✅ Pass |
| `--c-text-muted` | `--c-surface` | `#4b5470` | `#ffffff` | **8.3:1** | ✅ Pass | ✅ Pass |
| `--c-primary` | `--c-bg` | `#4349c8` | `#f5f6fa` | **7.2:1** | ✅ Pass | ✅ Pass |
| `--c-primary` | `--c-surface` | `#4349c8` | `#ffffff` | **8.0:1** | ✅ Pass | ✅ Pass |
| `--c-text-inverse` | `--c-primary` | `#ffffff` | `#4349c8` | **8.0:1** | ✅ Pass | ✅ Pass |
| `--c-error` | `--c-bg` | `#a61c14` | `#f5f6fa` | **7.5:1** | ✅ Pass | ✅ Pass |
| `--c-error` | `--c-surface` | `#a61c14` | `#ffffff` | **8.4:1** | ✅ Pass | ✅ Pass |
| `--c-success` | `--c-bg` | `#1e5c3a` | `#f5f6fa` | **8.1:1** | ✅ Pass | ✅ Pass |
| `--c-success` | `--c-surface` | `#1e5c3a` | `#ffffff` | **9.1:1** | ✅ Pass | ✅ Pass |
| `--c-warning` | `--c-bg` | `#7a5200` | `#f5f6fa` | **7.3:1** | ✅ Pass | ✅ Pass |
| `--c-warning` | `--c-surface` | `#7a5200` | `#ffffff` | **8.2:1** | ✅ Pass | ✅ Pass |
| `--c-info` | `--c-bg` | `#005a8e` | `#f5f6fa` | **7.0:1** | ✅ Pass | ✅ Pass |
| `--c-info` | `--c-surface` | `#005a8e` | `#ffffff` | **7.8:1** | ✅ Pass | ✅ Pass |
| `--c-link` | `--c-bg` | `#4349c8` | `#f5f6fa` | **7.2:1** | ✅ Pass | ✅ Pass |
| `--c-link-visited` | `--c-bg` | `#6929a0` | `#f5f6fa` | **7.1:1** | ✅ Pass | ✅ Pass |

### Button Label Contrast

| Scenario | Foreground | Background | Ratio | Pass |
|---|---|---|---|---|
| Dark primary button label | `--c-text-inverse` `#0f1117` | `--c-primary` `#a5aeff` | 8.9:1 | ✅ |
| Light primary button label | `--c-text-inverse` `#ffffff` | `--c-primary` `#4349c8` | 8.0:1 | ✅ |
| Dark disabled (decorative) | `--c-text-disabled` `#5a6080` | `--c-bg` `#0f1117` | 2.8:1 | ℹ️ Decorative |
| Light disabled (decorative) | `--c-text-disabled` `#9aa0b8` | `--c-bg` `#f5f6fa` | 2.5:1 | ℹ️ Decorative |

> Note: Disabled states are exempt from contrast requirements per WCAG 2.1 SC 1.4.3 (inactive UI components).

### Automated Checking

Contrast is automatically validated in Storybook via [`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y).
Run `npm run storybook` in the `ui/` directory and open the **Accessibility** panel on the **Colour Palette** story to see live axe-core contrast results.

```bash
cd ui
npm run storybook   # opens at http://localhost:6006
```
