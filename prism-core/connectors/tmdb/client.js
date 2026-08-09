const TMDB_BASE='https://api.themoviedb.org/3';
export class TmdbHttpClient {
  constructor({token='',fetchImpl=globalThis.fetch,baseUrl=TMDB_BASE,timeoutMs=12000}={}) {
    this.token=String(token||'').trim();
    this.fetchImpl=(...args)=>fetchImpl(...args);
    this.baseUrl=baseUrl;
    this.timeoutMs=timeoutMs;
  }
  setToken(token){this.token=String(token||'').trim()}
  async get(path, params={}) {
    if(!this.token) throw new Error('TMDb token required');
    const url=new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([k,v])=>v!=null&&url.searchParams.set(k,String(v)));
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),this.timeoutMs);
    let response;
    try {
      response=await this.fetchImpl(url,{
        headers:{Authorization:`Bearer ${this.token}`,accept:'application/json'},
        signal:controller.signal
      });
    } catch(error) {
      if(error?.name==='AbortError') throw new Error('TMDb request timed out');
      throw new Error(`TMDb network request failed: ${error?.message||'unknown error'}`);
    } finally {
      clearTimeout(timer);
    }
    if(!response.ok) {
      let detail='';
      try { detail=(await response.json())?.status_message||''; } catch {}
      throw new Error(detail||`TMDb request failed (${response.status})`);
    }
    return response.json();
  }
}
