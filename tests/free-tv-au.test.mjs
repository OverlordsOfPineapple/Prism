import assert from 'node:assert/strict';
import { mapTmdbDetails } from '../prism-core/connectors/tmdb/mapper.js';

const movie = mapTmdbDetails({
  id: 101,
  title: 'Free TV Test',
  release_date: '2026-09-13',
  runtime: 90,
  genres: [{name:'Drama'}],
  credits: {crew: [], cast: []},
  videos: {results: []},
  recommendations: {results: []},
  similar: {results: []},
  release_dates: {results: []},
  'watch/providers': {
    results: {
      AU: {
        flatrate: [{provider_id: 1, provider_name: 'Paid Stream', logo_path: null}],
        free: [{provider_id: 2, provider_name: 'ABC iview', logo_path: null}],
        ads: [{provider_id: 3, provider_name: 'SBS On Demand', logo_path: null}]
      }
    }
  }
});

assert.equal(movie.providers.subscription.length, 1);
assert.equal(movie.providers.free.length, 1);
assert.equal(movie.providers.ads.length, 1);
assert.equal(movie.providers.free[0].name, 'ABC iview');
assert.equal(movie.providers.ads[0].name, 'SBS On Demand');
assert.equal(movie.providers.streaming.length, 3);

console.log('Free TV Australia tests passed.');
