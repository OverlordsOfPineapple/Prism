import { mapTmdbSummary, mapTmdbDetails } from './mapper.js';
export class TmdbConnector {
  constructor({client,region='AU',language='en-AU'}={}) { this.client=client; this.region=region; this.language=language; }
  setToken(token){this.client.setToken(token)}
  async getTrendingMovies({limit=20}={}) {
    const data=await this.client.get('/trending/movie/week',{language:this.language});
    return (data.results||[]).slice(0,limit).map(mapTmdbSummary);
  }
  async searchMovies(query,{limit=20}={}) {
    const q=String(query||'').trim();
    if(!q)return [];
    const data=await this.client.get('/search/movie',{query:q,language:this.language,include_adult:false});
    return (data.results||[]).slice(0,limit).map(mapTmdbSummary);
  }
  async getMovie(id) {
    const data=await this.client.get(`/movie/${Number(id)}`,{
      language:this.language,
      append_to_response:'credits,videos,images,watch/providers,recommendations,similar,external_ids,release_dates,keywords',
      include_image_language:'en,null'
    });
    return mapTmdbDetails(data,{region:this.region});
  }
}
