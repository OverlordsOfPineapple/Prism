# Prism Architecture — Milestone 1

Prism now uses a provider-agnostic core. Presentation code never imports or calls TMDb directly.

## Data flow

```text
UI (`js/app.js`)
  → MovieService
    → cache + in-flight request deduplication
      → MovieConnector contract
        → TMDb connector
          → TMDb HTTP client
            → TMDb API
```

Every connector returns the canonical `Movie` entity defined in `prism-core/models/Movie.js`. The entity groups information into `basic`, `artwork`, `credits`, `providers`, `ratings`, `media`, `recommendations`, `collection`, `external`, `release`, and `statistics`.

Compatibility getters such as `movie.title`, `movie.poster`, and `movie.runtime` allow the existing cinematic UI to consume canonical objects without knowledge of provider payloads.

## Core modules

- `prism-core/models/` — canonical entities
- `prism-core/contracts/` — connector compliance checks
- `prism-core/cache/` — memory cache with fresh, stale, and expired states
- `prism-core/connectors/tmdb/` — TMDb transport and mapping
- `prism-core/services/` — provider-neutral application services
- `prism-core/adapters/` — normalization for built-in demo data

## Performance behavior

`MovieService` provides:

- request deduplication for concurrent identical calls
- configurable catalogue and detail TTLs
- stale-while-revalidate reads
- background detail prefetch support
- explicit invalidation

TMDb movie details use `append_to_response` to retrieve credits, videos, images, providers, recommendations, similar films, external IDs, release dates, and keywords in one request.

## Security boundary

The local prototype still stores a TMDb Read Access Token in browser storage. A public deployment must place the connector behind a backend proxy so private credentials are never shipped to the browser.
