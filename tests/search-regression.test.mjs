import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const app=await readFile(new URL('../js/app.js',import.meta.url),'utf8');
assert.match(app,/movieService\.searchMovies\(query/,'search must use MovieService');
assert.match(app,/searchResults=results/,'live search results must remain separate from catalogue');
assert.match(app,/searchResults=\[\]/,'search state must be resettable');
assert.match(app,/dedupeMovies\(\[\.\.\.next,\.\.\.demoCatalogue\]\)/,'live catalogue must preserve Prism mockups');
console.log('Search regression tests passed.');
