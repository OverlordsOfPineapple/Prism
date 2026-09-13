import { Movie } from '../../models/Movie.js';
import { Person } from '../../models/Person.js';
import { Provider } from '../../models/Provider.js';
const IMAGE='https://image.tmdb.org/t/p';
const GENRES={28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'};
export const image=(path,size)=>path?`${IMAGE}/${size}${path}`:'';
const rows=i=>[i<8?'Trending Now':'Critically Acclaimed',i%3===0?'Now Showing':'New to Streaming',i%4===0?'Because You Watched Sci-Fi':'Coming Soon'];
const trailer=videos=>videos.find(v=>v.site==='YouTube'&&v.type==='Trailer'&&v.official)||videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
const releaseCert=(releaseDates,region='AU')=>releaseDates?.results?.find(r=>r.iso_3166_1===region)?.release_dates?.find(r=>r.certification)?.certification||'Unrated';
export function mapTmdbSummary(item,index=0){
  const date=item.release_date||'';
  return new Movie({basic:{id:item.id,title:item.title||item.original_title,originalTitle:item.original_title,overview:item.overview,releaseDate:date,year:date?Number(date.slice(0,4)):null,genres:(item.genre_ids||[]).map(id=>GENRES[id]).filter(Boolean),language:item.original_language},artwork:{poster:image(item.poster_path,'w500'),backdrop:image(item.backdrop_path,'w1280')||image(item.poster_path,'w1280')},ratings:{tmdb:item.vote_average||null,voteCount:item.vote_count||0,popularity:item.popularity||0},discovery:{rows:rows(index)},meta:{source:'tmdb',enriched:false}});
}
export function mapTmdbDetails(item,{region='AU'}={}){
  const credits=item.credits||{}, providers=item['watch/providers']?.results?.[region]||{}, videos=item.videos?.results||[];
  const unique=list=>[...new Map((list||[]).map(p=>[p.provider_id,p])).values()];
  const provider=(p,type)=>new Provider({id:p.provider_id,name:p.provider_name,logo:image(p.logo_path,'w185'),type});
  const subscription=unique(providers.flatrate).map(p=>provider(p,'streaming'));
  const free=unique(providers.free).map(p=>provider(p,'free'));
  const ads=unique(providers.ads).map(p=>provider(p,'ads'));
  const streaming=unique([...(providers.flatrate||[]),...(providers.free||[]),...(providers.ads||[])]).map(p=>provider(p,'streaming'));
  const rec=(item.recommendations?.results||[]).slice(0,6).map(mapTmdbSummary);
  const sim=(item.similar?.results||[]).slice(0,6).map(mapTmdbSummary);
  const date=item.release_date||'';
  return new Movie({
    basic:{id:item.id,title:item.title||item.original_title,originalTitle:item.original_title,overview:item.overview,releaseDate:date,year:date?Number(date.slice(0,4)):null,runtimeMinutes:item.runtime||null,classification:releaseCert(item.release_dates,region),genres:(item.genres||[]).map(g=>g.name),language:item.original_language,status:item.status},
    artwork:{poster:image(item.poster_path,'w500'),backdrop:image(item.backdrop_path,'w1280')||image(item.poster_path,'w1280'),posters:(item.images?.posters||[]).slice(0,12).map(x=>image(x.file_path,'w300')),backdrops:(item.images?.backdrops||[]).slice(0,12).map(x=>image(x.file_path,'w1280')),logos:(item.images?.logos||[]).slice(0,6).map(x=>image(x.file_path,'w300'))},
    credits:{director:credits.crew?.find(p=>p.job==='Director')?.name||'Not listed',cast:(credits.cast||[]).slice(0,10).map(p=>new Person({id:p.id,name:p.name,character:p.character,photo:image(p.profile_path,'h632')})),crew:(credits.crew||[]).map(p=>new Person({id:p.id,name:p.name,job:p.job,department:p.department,photo:image(p.profile_path,'h632')})),studios:(item.production_companies||[]).slice(0,6).map(c=>({id:c.id,name:c.name,logo:image(c.logo_path,'w300')}))},
    providers:{region,link:providers.link||'',streaming,subscription,free,ads,rent:unique(providers.rent).map(p=>provider(p,'rent')),buy:unique(providers.buy).map(p=>provider(p,'buy'))},
    ratings:{tmdb:item.vote_average||null,voteCount:item.vote_count||0,popularity:item.popularity||0},
    media:{trailerId:trailer(videos)?.key||'',videos}, recommendations:rec, similar:sim,
    collection:item.belongs_to_collection||null, external:item.external_ids||{}, release:item.release_dates||{}, statistics:{budget:item.budget||0,revenue:item.revenue||0},
    discovery:{rows:[]}, meta:{source:'tmdb',enriched:true}
  });
}
