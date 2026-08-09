import assert from 'node:assert/strict';
import { Movie, MemoryCache, MovieService } from '../prism-core/index.js';

const movie=new Movie({basic:{id:42,title:'Nexus',runtimeMinutes:125,genres:['Science Fiction']},ratings:{tmdb:8.25},providers:{streaming:[{name:'Prism+'}]},meta:{source:'test'}});
assert.equal(movie.id,42);assert.equal(movie.runtime,'2h 05m');assert.equal(movie.imdb,'8.3');assert.equal(movie.genre,'Science Fiction');assert.equal(movie.providersList[0].name,'Prism+');assert.ok(Object.isFrozen(movie));

let now=0;const cache=new MemoryCache({ttlMs:10,staleMs:10,now:()=>now});cache.set('x',1);assert.deepEqual(cache.inspect('x'),{state:'fresh',value:1});now=11;assert.equal(cache.inspect('x').state,'stale');now=21;assert.equal(cache.inspect('x').state,'miss');

let trendingCalls=0, searchCalls=0, detailCalls=0;
const connector={async getTrendingMovies(){trendingCalls++;await new Promise(r=>setTimeout(r,5));return [movie]},async searchMovies(query){searchCalls++;await new Promise(r=>setTimeout(r,5));return query?[movie]:[]},async getMovie(){detailCalls++;await new Promise(r=>setTimeout(r,5));return movie}};
const service=new MovieService({connector,cache:new MemoryCache({ttlMs:1000,staleMs:1000})});
const [a,b]=await Promise.all([service.getTrendingMovies(),service.getTrendingMovies()]);assert.equal(a,b);assert.equal(trendingCalls,1);await service.getTrendingMovies();assert.equal(trendingCalls,1);
const [s1,s2]=await Promise.all([service.searchMovies('nexus'),service.searchMovies('nexus')]);assert.equal(s1,s2);assert.equal(searchCalls,1);await service.searchMovies('nexus');assert.equal(searchCalls,1);
await Promise.all([service.getMovie(42),service.getMovie(42)]);assert.equal(detailCalls,1);
console.log('Prism Core tests passed.');
