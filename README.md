# Inovest – Transaction dashboard

A small Vue 3 + Tailwind CSS dashboard that shows an account summary and its recent transactions, with filtering, sorting and a details view.

## Running it locally

Requires **Node 22.18+ or 24.12+**.

```sh
npm install
cp .env.example .env     # sets the API URL and the fake network delay
npm run dev              # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm run preview` | Production build / serve the build locally |
| `npm run test:unit` | Vitest in watch mode (`npm run test:unit -- --run` for a single run) |
| `npm run lint` | oxlint + ESLint |

`.env` points the app at `http://localhost:5173`. If Vite starts on a different port, update `VITE_API_URL` to match. Set `VITE_MOCK_LATENCY_MS=0` to turn off the artificial delay, or raise it to look at the loading states.

## What's implemented

- **Account summary:** name, current balance and currency.
- **Transactions:** merchant, date, amount, currency, type and status, newest first.
- **Filters and sort:** filter by merchant, status and type (combined); sort by date or amount in either direction. "Clear filters" resets the filters but keeps the sort order.
- **Details:** clicking a row (or Enter/Space on a focused row) opens a modal with the full description, category, payment method, location, reference and ID, plus the decline reason or a "not settled yet" note.
- **States:**
  - loading skeletons for both cards;
  - errors with a retry button;
  - "no transactions yet", shown separately from "no transactions match your filters" (which has its own clear-filters button);
  - a live "Showing X of Y" count.
- **Money:**
  - amounts are signed (+ for credits, − for debits);
  - credits are green, and declined amounts are greyed and struck through, since no money moved;
  - every amount is formatted in its own currency (€, US$, £).
- **Long text:** long merchant names are truncated in the list, with the full text in a tooltip and wrapped in the details view. The mock data includes one very long merchant and description to show this.
- **Responsive:**
  - phones get a stacked, tappable list instead of the table;
  - the details modal becomes a bottom sheet on phones;
  - the filters go from one column, to two, to a single row.

## Project structure

```
public/api/            Mock API: account.json, transactions.json, filters.json
src/
  services/apiAgent.js Axios instance + one agent per resource (AccountApiAgent, …)
  queries/             TanStack Query wrappers: useAccountQuery, useTransactionsQuery, …
  views/HomeView.vue   The dashboard page: owns the data, filter state and selected transaction
  components/          Presentational pieces (table, cards, modal, badge, inputs, skeleton)
  config/              Column and filter definitions the components loop over
  helpers/utils.js     Pure functions: formatting, filtering, sorting, class mapping
  layouts/AppLayout.vue Header + page container shared by all routes
  assets/main.css      Tailwind import + theme tokens (colours, radius, type scale, font)
```

Data flows in one direction: `apiAgent` (HTTP), then `queries/` (caching and loading/error state), then `HomeView` (filters and selection), then components (props in, events out). `TransactionsTable` does no fetching or filtering. It receives the rows and state as props, emits `select`, `retry` and `clear-filters`, and takes the filter controls through a slot, so it can be mounted in tests with plain arrays.

## Technical decisions

- **TanStack Query instead of a Pinia store for server data.** It provides loading, error, retry and caching per request, so there is no hand-written fetch/loading/error boilerplate. Several components can call `useAccountQuery()` and share one cached request. UI state (filters, the selected transaction) is local to the page, so a global store wasn't needed.
- **Axios behind an "API agent".** One configured instance (base URL, timeout, interceptors) with methods grouped by resource. Swapping the static JSON for a real backend means changing `VITE_API_URL` and the endpoint paths, not the components.
- **Static JSON in `public/` as the mock API.** The files are real HTTP requests, visible in the Network tab. A request interceptor adds a configurable delay so loading states can actually be seen.
- **Filtering and sorting on the client.** The dataset is small, so it's done in `computed`s. The logic is in pure functions in `helpers/utils.js`, which makes it trivial to unit test and to move to the server later.
- **`Intl.NumberFormat` / `Intl.DateTimeFormat` for money and dates.** These give correct symbols, grouping and decimals per currency without a formatting library. Amounts are stored as positive numbers, with `type` giving the direction, which avoids sign mistakes in the data.
- **Tailwind v4 theme tokens** (`@theme` in `main.css`) for colours, radius, text sizes and weights. Components use semantic names (`text-muted`, `bg-success-soft`, `rounded-card`) instead of raw palette values.
- **Config-driven table headings and filter dropdowns** (`src/config/`). Renaming, reordering or adding a filter is a one-line change.
- **Libraries, and why:**
  - `@tanstack/vue-query`: server state (above);
  - `axios`: interceptors and a shared instance;
  - `@heroicons/vue`: made by the Tailwind team, tree-shaken per icon;
  - `@fontsource-variable/inter`: a self-hosted variable font, with no request to Google Fonts;
  - `vue-router`: routing, ready for a `/transactions/:id` page if needed.
- **`process.env.VITE_*` in app code.** A small plugin in `vite.config.js` replaces `process.env` at build time with only the `VITE_`-prefixed variables. This is a personal preference; the usual Vite approach is `import.meta.env`.

## Trade-offs and known limitations

- **Sorting by amount compares raw numbers across currencies**, so £342 sorts below €950. A real app would sort by the amount converted into the account currency, or group by currency.
- **Amounts are JavaScript numbers (decimals).** That's fine for display, since `Intl` always rounds to the currency's decimals. Any arithmetic, such as totals or balances, should use integer minor units (cents) or a decimal library to avoid floating-point errors.
- **The modal closes only with its X button.** There's no Escape key, focus trap or backdrop click. A production version should add Escape and a focus trap (for example `focus-trap`) for accessibility.
- **Filter state isn't kept in the URL**, so it resets on refresh and can't be shared.
- **`filters.json` is maintained by hand.** Its merchant list has to match the merchants in `transactions.json`. With a real API, the backend would provide the options, or they'd be derived from the data.
- **No pagination or virtualised list.** That's fine for tens of rows, but a real transaction history would need server-side pagination or infinite scroll.

## With more time

- Keep filters and sort in the URL query string.
- Add Escape-to-close and a focus trap to the modal, and restore focus to the clicked row.
- Add a merchant text search alongside the dropdown, and date-range filtering.
- Add server-side pagination, filtering and sorting against a real API, with query keys that include the filters.
- Show converted amounts in the account currency, and totals using integer minor units.
- Add component tests for the modal and the page, plus an end-to-end test of the main flow (Playwright).
- Add dark mode (the theme tokens make this mostly a matter of redefining them).

## Tests

Tests use Vitest and Vue Test Utils. They focus on the logic that's easiest to get wrong:

- `src/helpers/__tests__/utils.spec.js`:
  - money formatting across currencies, and signed amounts;
  - filter combinations, and sorting in both directions (without mutating the input);
  - the filter-state helpers.
- `src/components/__tests__/TransactionsTable.spec.js`:
  - the loading, error, empty and no-results states;
  - the emitted events, from both the desktop row and the mobile card.
