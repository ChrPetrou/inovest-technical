# Inovest – Transaction dashboard

## Running it locally

Requires **Node 22.18+ or 24.12+**.

```sh
npm install
cp .env.example .env     # sets the API URL and the fake network delay
npm run dev              # http://localhost:5173
```

`.env` points the app at `http://localhost:5173`. If Vite starts on a different port, update `VITE_API_URL` to match. Set `VITE_MOCK_LATENCY_MS=0` to turn off the artificial delay, or raise it to look at the loading states.

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

Data flows in one direction: `apiAgent` (HTTP), then `queries/` (caching and loading/error state), then `HomeView` (filters and selection), then components (props in, events out).

## Technical decisions

- **TanStack Query instead of a Pinia store for server data.** It provides loading, error, retry and caching per request, so there is no hand-written fetch/loading/error boilerplate. Several components can call `useAccountQuery()` and share one cached request. UI state (filters, the selected transaction) is local to the page, so a global store wasn't needed.
- **Axios behind an "API agent".** One configured instance (base URL, timeout, interceptors) with methods grouped by resource. Swapping the static JSON for a real backend means changing `VITE_API_URL` and the endpoint paths, not the components.
- **Static JSON in `public/` as the mock API.** The files are real HTTP requests, visible in the Network tab. A request interceptor adds a configurable delay so loading states can actually be seen.
- **`Intl.NumberFormat` / `Intl.DateTimeFormat` for money and dates.** These give correct symbols, grouping and decimals per currency without a formatting library. Amounts are stored as positive numbers, with `type` giving the direction, which avoids sign mistakes in the data.
- **Libraries, and why:**
  - `@tanstack/vue-query`: server state (above);
  - `axios`: interceptors and a shared instance;
  - `@heroicons/vue`: made by the Tailwind team, tree-shaken per icon;
  - `@fontsource-variable/inter`: a self-hosted variable font, with no request to Google Fonts;
  - `vue-router`: routing, ready for a `/transactions/:id` page if needed.
- **`process.env.VITE_*` in app code.** A small plugin in `vite.config.js` replaces `process.env` at build time with only the `VITE_`-prefixed variables. This is a personal preference; the usual Vite approach is `import.meta.env`.

## Trade-offs and known limitations

- **Filter state isn't kept in the URL**, so it resets on refresh and can't be shared.
- **No pagination or virtualised list.** That's fine for tens of rows, but a real transaction history would need server-side pagination or infinite scroll.

## With more time

- Keep filters and sort in the URL query string.
- Add server-side pagination, filtering and sorting against a real API, with query keys that include the filters.
- Add component tests for the modal and the page, plus an end-to-end test of the main flow (Playwright).
- Add dark mode (the theme tokens make this mostly a matter of redefining them).
