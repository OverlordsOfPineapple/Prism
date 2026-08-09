import { assertMovieConnector } from '../contracts/MovieConnector.js';
import { MemoryCache } from '../cache/MemoryCache.js';
export class MovieService {
  constructor({connector,cache=new MemoryCache(),catalogueTtlMs=10*60_000,detailTtlMs=30*60_000}={}) {
    this.connector=assertMovieConnector(connector); this.cache=cache; this.catalogueTtlMs=catalogueTtlMs; this.detailTtlMs=detailTtlMs; this.inflight=new Map();
  }
  setToken(token){this.connector.setToken?.(token);this.cache.clear()}
  async #once(key,loader){ if(this.inflight.has(key))return this.inflight.get(key); const p=Promise.resolve().then(loader).finally(()=>this.inflight.delete(key));this.inflight.set(key,p);return p; }
  async #cached(key,loader,ttlMs,{force=false}={}) {
    if(!force){const hit=this.cache.inspect(key);if(hit.state==='fresh')return hit.value;if(hit.state==='stale'){this.#once(key,async()=>this.cache.set(key,await loader(),{ttlMs})).catch(console.error);return hit.value;}}
    return this.#once(key,async()=>this.cache.set(key,await loader(),{ttlMs}));
  }
  getTrendingMovies(options={}) { return this.#cached(`movies:trending:${options.limit||20}`,()=>this.connector.getTrendingMovies(options),this.catalogueTtlMs,options); }
  searchMovies(query,options={}) { const q=String(query||'').trim().toLowerCase(); return this.#cached(`movies:search:${q}:${options.limit||20}`,()=>this.connector.searchMovies(query,options),this.catalogueTtlMs,options); }
  getMovie(id,options={}) { return this.#cached(`movie:${Number(id)}`,()=>this.connector.getMovie(id),this.detailTtlMs,options); }
  prefetchMovie(id){return this.getMovie(id).then(()=>true).catch(()=>false)}
  invalidateMovie(id){this.cache.delete(`movie:${Number(id)}`)}
}
