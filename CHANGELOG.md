## 2.4.2
- Replaced streaming-service wordmark pills with compact circular icons.
- Service icons now filter Prism and open the corresponding Australian streaming service in a new tab.
- Provider cards in movie details are now clickable and open current TMDb/JustWatch availability when available.

# Changelog

## 2.3.1 — Search & Catalogue Stabilization

- Added live TMDb title search through MovieService and TmdbConnector.
- Kept search results isolated from the browsing catalogue.
- Restored the previous catalogue when search is cleared or closed.
- Preserved Prism mockup titles alongside live TMDb content.
- Added search regression coverage and connector contract coverage.

## 2.3.0 — Prism Core Milestone 1

- Added canonical provider-agnostic Movie, Person, and Provider entities.
- Added MovieService as the sole UI data access layer.
- Added TMDb connector, HTTP client, and canonical mapper.
- Consolidated rich movie detail retrieval through TMDb `append_to_response`.
- Added memory caching, expiration, stale-while-revalidate refresh, request deduplication, prefetch, and invalidation.
- Migrated demo and live catalogues to canonical Movie objects.
- Removed the UI's direct dependency on the legacy TMDb client.
- Added automated core and mapper tests.

## 2.2.0

- Cinematic discovery interface baseline.

## 2.4.1
- Replaced text-only streaming-service filters with local branded logo assets.
- Added compact, responsive logo pills with selected and hover states.
- Preserved accessible service labels and existing filtering behaviour.
