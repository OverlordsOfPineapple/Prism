export class MemoryCache {
  constructor({ttlMs=15*60_000, staleMs=60*60_000, now=()=>Date.now()}={}) {
    this.ttlMs=ttlMs; this.staleMs=staleMs; this.now=now; this.entries=new Map();
  }
  set(key,value,{ttlMs=this.ttlMs,staleMs=this.staleMs}={}) {
    const created=this.now(); this.entries.set(key,{value,created,expires:created+ttlMs,staleUntil:created+ttlMs+staleMs}); return value;
  }
  inspect(key) {
    const entry=this.entries.get(key); if(!entry) return {state:'miss',value:undefined};
    const time=this.now();
    if(time<=entry.expires) return {state:'fresh',value:entry.value};
    if(time<=entry.staleUntil) return {state:'stale',value:entry.value};
    this.entries.delete(key); return {state:'miss',value:undefined};
  }
  get(key) { const hit=this.inspect(key); return hit.state==='fresh'?hit.value:undefined; }
  delete(key){return this.entries.delete(key)}
  clear(){this.entries.clear()}
}
