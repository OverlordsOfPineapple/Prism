# Prism 2.3 — Core Foundation

Prism is a premium entertainment discovery platform. Version 2.3 introduces Prism Core: a provider-neutral data and service layer beneath the existing cinematic interface.

## Run locally

```bash
./scripts/setup.sh       # first installation
cd ~/Projects/Prism
./scripts/dev.sh
```

## Test

```bash
node tests/prism-core.test.mjs
node tests/tmdb-mapper.test.mjs
./scripts/health-check.sh
```

## Architecture

The UI calls `MovieService`; it does not call TMDb. `MovieService` handles caching, duplicate-request suppression, stale-while-revalidate behavior, and connector access. All connectors return canonical `Movie` objects.

See `docs/Architecture.md` for the complete Milestone 1 design.

## Main structure

- `js/app.js` — UI orchestration consuming `MovieService`
- `prism-core/models/` — canonical Movie, Person, and Provider entities
- `prism-core/services/` — provider-neutral service layer
- `prism-core/cache/` — memory cache
- `prism-core/connectors/tmdb/` — TMDb connector, HTTP client, and mapper
- `tests/` — contract, caching, deduplication, and mapper tests
- `css/` — cinematic presentation
- `scripts/` — local development and release operations

## Security

The local prototype stores a TMDb Read Access Token in browser storage. Public deployment requires a server-side API proxy.
