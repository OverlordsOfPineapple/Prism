import { demoMovies } from './data/demo-data.js';
import { castCard } from './ui/cast.js';
import { $, $$, debounce, rafThrottle } from './utils/dom.js';
import { readStorage, writeStorage, removeStorage } from './utils/storage.js';
import { applyTheme, nextTheme } from './ui/theme.js';
import { initFounderMode } from './ui/founder.js';
import { MovieService, TmdbConnector, TmdbHttpClient, normalizeDemoMovie } from '../prism-core/index.js';

const demoCatalogue = demoMovies.map(normalizeDemoMovie);
let movies = [...demoCatalogue];
let searchResults = [];
const TMDB_TOKEN_KEY='prism-tmdb-token';
let tmdbToken = String(readStorage(TMDB_TOKEN_KEY, readStorage('tmdb-token', '')) || '').trim();
const movieService = new MovieService({connector:new TmdbConnector({client:new TmdbHttpClient({token:tmdbToken}),region:'AU'})});
const defaultRows=['Trending Now','Now Showing','Coming Soon','New to Streaming','Because You Watched Sci-Fi','Critically Acclaimed'];
const movieById=new Map(movies.map(movie=>[movie.id,movie]));
let featuredMovies=movies.slice(0,6);
const state={live:false,view:'home',service:'All',query:'',filter:null,collection:'All',genre:'All',decade:'All',minRating:0,theme:readStorage('prism-theme',readStorage('rr-theme','pink')),hero:0,current:null,watchlist:new Set(readStorage('rr-watchlist',[])),watched:new Set(readStorage('rr-watched',[])),favourites:new Set(readStorage('rr-favourites',[])),ratings:readStorage('rr-ratings',{}),notes:readStorage('rr-notes',{})};
const collections={
'Film Noir':[3,6,9],
'Mind-Bending':[1,2,5,10],
'Ocean Stories':[4,8],
'After Dark':[3,6,9,11],
'Family Night':[7,10]
};
function persist(){writeStorage('rr-watchlist',[...state.watchlist]);writeStorage('rr-watched',[...state.watched]);writeStorage('rr-favourites',[...state.favourites]);writeStorage('rr-ratings',state.ratings);writeStorage('rr-notes',state.notes)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1800)}
function filtered(){const pool=state.query.trim()?dedupeMovies([...searchResults,...movies]):movies;return pool.filter(m=>{const service=state.service==='All'||m.providersList.some(p=>(typeof p==='string'?p:p.name)===state.service);const q=state.query.trim().toLowerCase();const search=!q||`${m.title} ${m.genre} ${m.providersList.map(p=>typeof p==='string'?p:p.name).join(' ')}`.toLowerCase().includes(q);const special=!state.filter||(state.filter==='hidden'&&m.rows.includes('Hidden Gems'))||(state.filter==='rated'&&Number(m.imdb)>=8)||(state.filter==='unwatched'&&!state.watched.has(m.id))||(state.filter==='favourites'&&state.favourites.has(m.id));const collection=state.collection==='All'||(collections[state.collection]||[]).includes(m.id);const genre=state.genre==='All'||m.genre.toLowerCase().includes(state.genre.toLowerCase());const decade=state.decade==='All'||String(m.year).startsWith(String(state.decade).slice(0,3));const rating=Number(m.imdb)>=Number(state.minRating||0);return service&&search&&special&&collection&&genre&&decade&&rating})}
function dedupeMovies(items){return [...new Map(items.map(item=>[`${item.source}:${item.id}`,item])).values()]}
function card(m){const listed=state.watchlist.has(m.id),fav=state.favourites.has(m.id);return `<article class="card"><button class="poster-btn" data-open="${m.id}" aria-label="Open ${m.title}"><img src="${m.poster}" alt="Poster artwork for ${m.title}" loading="lazy" decoding="async" width="800" height="1200"><div class="card-overlay"><div class="card-title">${m.title}</div><div class="card-meta"><span class="imdb">IMDb ${m.imdb}</span><span>${m.year}</span></div></div></button><div class="card-actions"><button class="${listed?'active':''}" data-list="${m.id}" aria-label="Toggle My List">${listed?'✓':'+'}</button><button class="${fav?'active':''}" data-fav="${m.id}" aria-label="Toggle favourite">${fav?'♥':'♡'}</button></div></article>`}
function renderRows(){updateDiscoverySummary();if(state.view==='stats'){renderStats();return}$('#contentRows').hidden=false;$('#statsPanel').hidden=true;const list=filtered();let rows=defaultRows;if(state.view==='watchlist')rows=['My List'];if(state.view==='calendar')rows=['Release Calendar'];if(state.view==='streaming')rows=['New to Streaming','Trending Now','Critically Acclaimed'];if(state.view==='movies')rows=['Now Showing','Coming Soon','Big Screen Spectacles'];let html='';for(const row of rows){let items=row==='My List'?list.filter(m=>state.watchlist.has(m.id)):row==='Release Calendar'?[...list].sort((a,b)=>new Date(a.basic.releaseDate||0)-new Date(b.basic.releaseDate||0)):list.filter(m=>m.rows.includes(row));if(!items.length)continue;html+=`<section class="row-section"><div class="row-header"><h2>${row}</h2><span>${items.length} titles</span></div><div class="poster-wrap"><div class="row-scroll">${items.map(card).join('')}</div></div></section>`}$('#contentRows').innerHTML=html||'<div class="empty-state"><h2>Nothing found</h2><p>Try another search or reset the filters.</p></div>'}
function renderHeroDots(){$('#heroDots').innerHTML=featuredMovies.map((_,i)=>`<button class="hero-dot ${i===state.hero?'active':''}" data-hero="${i}" aria-label="Featured title ${i+1}"></button>`).join('')}
function preloadBackdrop(url){const image=new Image();image.decoding='async';image.src=url}
function setHero(i){state.hero=(i+featuredMovies.length)%featuredMovies.length;const m=featuredMovies[state.hero],media=$('#heroMedia');media.style.opacity='0';clearTimeout(setHero.timer);setHero.timer=setTimeout(()=>{media.style.backgroundImage=`url('${m.backdrop}')`;media.style.opacity='1';preloadBackdrop(featuredMovies[(state.hero+1)%featuredMovies.length].backdrop)},140);const content=$('#heroContent');content.classList.remove('animate');requestAnimationFrame(()=>content.classList.add('animate'));$('#heroTitle').textContent=m.title.toUpperCase();$('#heroMeta').textContent=`IMDb ${m.imdb} · ${m.year} · ${m.runtime} · ${m.classification} · ${m.genre}`;$('#heroOverview').textContent=m.overview;$$('.hero-dot').forEach((d,n)=>d.classList.toggle('active',n===state.hero));$('#heroInfo').onclick=()=>openModal(m.id);$('#playHero').onclick=()=>openTrailer(m)}
function getTrailerId(m){return m.trailerId||m.youtubeId||''}
function stopTrailer(){const frame=$('#trailerFrame');if(frame)frame.innerHTML=''}
function renderTrailer(m,autoplay=false){const section=$('#trailerSection'),frame=$('#trailerFrame'),status=$('#trailerStatus'),external=$('#trailerExternal');if(!section||!frame||!status||!external)return;stopTrailer();section.hidden=false;const id=getTrailerId(m),search=`https://www.youtube.com/results?search_query=${encodeURIComponent(m.title+' official trailer')}`;if(id){const safe=encodeURIComponent(id);frame.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${safe}?rel=0&modestbranding=1${autoplay?'&autoplay=1':''}" title="${m.title} official trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;status.textContent='';external.href=`https://www.youtube.com/watch?v=${safe}`}else{frame.innerHTML=`<div class="trailer-empty"><span>Trailer not connected yet</span><p>Prism will embed the official trailer here when a verified YouTube ID is available.</p></div>`;status.textContent='The demo catalogue uses fictional films, so Prism will not invent trailer links.';external.href=search}}
function openTrailer(m){renderTrailer(m,true);$('#trailerSection')?.scrollIntoView({behavior:'smooth',block:'center'})}
const providerHomepages={'Netflix':'https://www.netflix.com/au/','Disney+':'https://www.disneyplus.com/en-au','Prime Video':'https://www.primevideo.com/','Binge':'https://binge.com.au/','Stan':'https://www.stan.com.au/','Apple TV+':'https://tv.apple.com/au/'};
function providerCard(p,label='Stream',watchLink=''){const name=typeof p==='string'?p:p.name;const logo=typeof p==='string'?'':p.logo;const href=watchLink||providerHomepages[name]||'';const content=`${logo?`<img src="${logo}" alt="" loading="lazy" decoding="async" width="84" height="84">`:`<span aria-hidden="true">${name.slice(0,1)}</span>`}<div><strong>${name}</strong><small>${label} in Australia</small></div>`;return href?`<a class="provider-card" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Open ${name} availability">${content}</a>`:`<article class="provider-card">${content}</article>`}
function providerGroup(title,list,label,watchLink=''){return list?.length?`<section class="provider-group"><h4>${title}</h4><div class="provider-grid">${list.map(p=>providerCard(p,label,watchLink)).join('')}</div></section>`:''}
function renderProviders(m){const streaming=m.providers?.streaming||[],rent=m.providers?.rent||[],buy=m.providers?.buy||[];const html=[providerGroup('Included with subscription',streaming,'Stream',m.providerLink),providerGroup('Rent',rent,'Rent',m.providerLink),providerGroup('Buy',buy,'Buy',m.providerLink)].join('');const link=m.providerLink?`<a class="provider-link" href="${m.providerLink}" target="_blank" rel="noopener noreferrer">Check current availability ↗</a>`:'';return html?`${html}${link}`:`<p class="detail-empty">No Australian streaming, rental or purchase availability is currently listed.</p>${link}`}
function studioCard(studio){return `<article class="studio-card">${studio.logo?`<img src="${studio.logo}" alt="${studio.name} logo" loading="lazy" decoding="async">`:`<span>${studio.name.slice(0,2).toUpperCase()}</span>`}<strong>${studio.name}</strong></article>`}
function renderModal(m){state.current=m;$('#modalBackdrop').style.backgroundImage=`url('${m.backdrop}')`;$('#modalPoster').style.backgroundImage=`url('${m.poster}')`;$('#modalEyebrow').textContent=m.source==='tmdb'?'LIVE FROM TMDB':'PRISM FEATURE';$('#modalTitle').textContent=m.title;$('#modalMeta').textContent=`${m.year||'—'} · ${m.runtime||'Runtime pending'} · ${m.classification||'Unrated'} · ${m.genre||'Genre pending'}`;$('#modalOverview').textContent=m.overview||'No synopsis is available yet.';$('#scoreStack').innerHTML=m.source==='tmdb'?`<article><span>TMDb</span><strong>${m.imdb||'—'}</strong><small>${m.voteCount?`${m.voteCount.toLocaleString()} votes`:'Community score'}</small></article><article><span>Popularity</span><strong>${m.popularity?Math.round(m.popularity):'—'}</strong><small>TMDb activity</small></article><article><span>Critics</span><strong>—</strong><small>Not supplied by TMDb</small></article>`:`<article><span>IMDb</span><strong>${m.imdb}</strong><small>Catalogue rating</small></article><article><span>Audience</span><strong>—</strong><small>Not connected</small></article><article><span>Critics</span><strong>—</strong><small>Not connected</small></article>`;$('#detailsGrid').innerHTML=`<div><dt>Director</dt><dd>${m.director||'Pending'}</dd></div><div><dt>Release</dt><dd>${m.releaseLabel||'Pending'}</dd></div><div><dt>Runtime</dt><dd>${m.runtime||'Pending'}</dd></div><div><dt>Classification</dt><dd>${m.classification||'Unrated'}</dd></div><div><dt>Genre</dt><dd>${m.genre||'Pending'}</dd></div><div><dt>Year</dt><dd>${m.year||'—'}</dd></div>`;const cast=Array.isArray(m.cast)?m.cast:(m.cast||'').split(',').map(name=>name.trim()).filter(Boolean);$('#castRow').innerHTML=cast.length?cast.map(castCard).join(''):'<p class="detail-empty">Cast details are loading.</p>';$('#modalProviders').innerHTML=renderProviders(m);$('#modalStudios').innerHTML=m.studios?.length?m.studios.map(studioCard).join(''):'<p class="detail-empty">Studio information appears with live TMDb details.</p>';$('#personalRating').value=state.ratings[m.id]||'';$('#personalNotes').value=state.notes[m.id]||'';const similar=m.similar?.length?m.similar:movies.filter(x=>x.id!==m.id&&(x.genre.split(' ')[0]===m.genre.split(' ')[0]||x.providersList.some(p=>m.providersList.some(mp=>(typeof mp==='string'?mp:mp.name)===(typeof p==='string'?p:p.name))))).slice(0,6);$('#similarRow').innerHTML=similar.map(x=>`<button class="similar-card" data-open="${x.id}"><img src="${x.poster}" alt="${x.title}" loading="lazy" decoding="async" width="800" height="1200"><span>${x.title}</span><small>${x.year||'—'} · ${x.imdb?`Score ${x.imdb}`:'New'}</small></button>`).join('');updateModalButtons();renderTrailer(m,false)}
async function openModal(id){let m=movieById.get(Number(id));if(!m)return;renderModal(m);if(!$('#detailModal').open)$('#detailModal').showModal();document.body.style.overflow='hidden';if(m.source==='tmdb'&&!m.enriched){$('#modalEyebrow').textContent='LOADING LIVE DETAILS';try{const details=await movieService.getMovie(m.id);const rows=m.rows; m=details.with({discovery:{rows}});movieById.set(m.id,m);const index=movies.findIndex(movie=>movie.id===m.id);if(index>=0)movies[index]=m;for(const similar of [...(m.similar||[]),...(m.recommendations||[])])if(!movieById.has(similar.id))movieById.set(similar.id,similar);renderModal(m)}catch(error){console.error(error);$('#modalEyebrow').textContent='LIVE DETAILS PARTIALLY AVAILABLE';toast('Some live details could not be loaded')}}}
function updateModalButtons(){const m=state.current;if(!m)return;$('#modalList').textContent=state.watchlist.has(m.id)?'✓ In My List':'＋ My List';$('#modalFavourite').textContent=state.favourites.has(m.id)?'♥ Favourite':'♡ Favourite';$('#modalWatched').textContent=state.watched.has(m.id)?'✓ Watched':'Mark Watched'}
function toggle(set,id,label){id=Number(id);const m=movieById.get(id);if(set.has(id)){set.delete(id);toast(`Removed ${m.title} from ${label}`)}else{set.add(id);toast(`Added ${m.title} to ${label}`)}persist();renderRows();updateModalButtons()}
function setView(v){state.view=v;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));renderRows();if(v==='streaming')hydrateProviderAvailability();const target=v==='stats'?$('#statsPanel'):$('#contentRows');window.scrollTo({top:v==='home'?0:target.offsetTop-90,behavior:'smooth'})}
function setFilter(filter,button){state.filter=state.filter===filter?null:filter;$$('.quick-tools button').forEach(b=>b.classList.remove('active'));if(state.filter&&button)button.classList.add('active');renderRows()}
function updateDiscoverySummary(){const parts=[];if(state.service!=='All')parts.push(state.service);if(state.filter==='hidden')parts.push('Hidden Gems');if(state.filter==='rated')parts.push('Top Rated');if(state.filter==='unwatched')parts.push('Unwatched');if(state.filter==='favourites')parts.push('Saved');if(state.genre!=='All')parts.push(state.genre);if(state.decade!=='All')parts.push(`${state.decade}s`);if(Number(state.minRating)>0)parts.push(`${state.minRating}+ IMDb`);if(state.collection!=='All')parts.push(state.collection);$('#discoverySummary').textContent=parts.length?parts.join(' · '):'All titles'}
function replaceCatalogue(next) {
  if(!Array.isArray(next)||!next.length)return;
  movies=dedupeMovies([...next,...demoCatalogue]);
  movieById.clear();
  for(const movie of movies)movieById.set(movie.id,movie);
  featuredMovies=movies.slice(0,6);
  state.live=movies.some(movie=>movie.source==='tmdb');
  state.hero=0;
  renderHeroDots();
  setHero(0);
  populateFilters();
  renderRows();
  $('#dataStatus')?.replaceChildren(document.createTextNode('Live TMDb + Australian streaming availability'));
  if($('#liveDataButton'))$('#liveDataButton').textContent='Live connected';
  if($('#founderData'))$('#founderData').textContent='TMDb live catalogue with Australian watch providers';
}
let providerHydration=null;
async function hydrateProviderAvailability(){
  if(!tmdbToken||providerHydration)return providerHydration;
  const pending=movies.filter(movie=>movie.source==='tmdb'&&!movie.enriched);
  if(!pending.length)return;
  const button=$('#liveDataButton');
  const previous=button?.textContent||'';
  if(button)button.textContent='Loading services…';
  providerHydration=(async()=>{
    let cursor=0;
    const workers=Array.from({length:Math.min(4,pending.length)},async()=>{
      while(cursor<pending.length){
        const movie=pending[cursor++];
        try{
          const details=await movieService.getMovie(movie.id);
          const enriched=details.with({discovery:{rows:movie.rows}});
          movieById.set(enriched.id,enriched);
          const index=movies.findIndex(item=>item.id===enriched.id);
          if(index>=0)movies[index]=enriched;
        }catch(error){console.warn(`Provider lookup failed for ${movie.title}`,error)}
      }
    });
    await Promise.all(workers);
    featuredMovies=movies.slice(0,6);
    renderRows();
  })().finally(()=>{providerHydration=null;if(button)button.textContent=state.live?'Live connected':previous});
  return providerHydration;
}

async function loadLiveCatalogue({showDialogOnFailure=true,showToast=true}={}) {
  const dialog=$('#dataDialog');
  const button=$('#liveDataButton');
  const errorBox=$('#dataError');

  if(!tmdbToken) {
    if(dialog&&!dialog.open) dialog.showModal();
    return false;
  }

  button.textContent='Connecting…';
  errorBox.textContent='';

  try {
    movieService.setToken(tmdbToken);
    const data=await movieService.getTrendingMovies({force:true});
    if(!Array.isArray(data)||data.length===0) throw new Error('TMDb returned no movies');
    replaceCatalogue(data);
    if(dialog?.open) dialog.close();
    if(showToast) toast('Prism is now using live movie data');
    return true;
  } catch(error) {
    console.error('Live catalogue failed:',error);
    button.textContent='Connect live data';
    errorBox.textContent=error?.message||'Connection failed.';
    if(showDialogOnFailure&&dialog&&!dialog.open) dialog.showModal();
    return false;
  }
}
renderHeroDots();setHero(0);renderRows();const rotateHero=()=>{if(!document.hidden&&!$('#detailModal').open&&state.view==='home')setHero(state.hero+1)};setInterval(rotateHero,15000);
window.addEventListener('scroll',rafThrottle(()=>$('#topbar').classList.toggle('scrolled',scrollY>20)),{passive:true});
document.addEventListener('click',e=>{const open=e.target.closest('[data-open]'),list=e.target.closest('[data-list]'),fav=e.target.closest('[data-fav]'),hero=e.target.closest('[data-hero]'),view=e.target.closest('[data-view]'),service=e.target.closest('[data-service]');if(open)openModal(open.dataset.open);if(list){e.stopPropagation();toggle(state.watchlist,list.dataset.list,'My List')}if(fav){e.stopPropagation();toggle(state.favourites,fav.dataset.fav,'Favourites')}if(hero)setHero(Number(hero.dataset.hero));if(view)setView(view.dataset.view);if(service){state.service=service.dataset.service;$$('.service').forEach(b=>b.classList.toggle('active',b===service));renderRows();if(state.live)hydrateProviderAvailability()}});
$('#heroPrev').onclick=()=>setHero(state.hero-1);$('#heroNext').onclick=()=>setHero(state.hero+1);$('#searchToggle').onclick=()=>{$('#searchPanel').hidden=false;$('#searchInput').focus()};$('#closeSearch').onclick=()=>{$('#searchPanel').hidden=true;state.query='';searchResults=[];$('#searchInput').value='';renderRows()};let searchSequence=0;const updateSearch=debounce(async value=>{const query=value.trim();state.query=query;if(!query){searchResults=[];renderRows();return}renderRows();if(!tmdbToken||query.length<2)return;const sequence=++searchSequence;try{const results=await movieService.searchMovies(query,{limit:20});if(sequence!==searchSequence||$('#searchInput').value.trim()!==query)return;searchResults=results;for(const movie of results)movieById.set(movie.id,movie);renderRows()}catch(error){console.error('Prism search failed',error);toast('Live search is temporarily unavailable')}} ,300);$('#searchInput').oninput=e=>updateSearch(e.target.value);$('#favouritesToggle').onclick=e=>setFilter('favourites',e.currentTarget);$('#hiddenGems').onclick=e=>setFilter('hidden',e.currentTarget);$('#topRated').onclick=e=>setFilter('rated',e.currentTarget);$('#unwatchedOnly').onclick=e=>setFilter('unwatched',e.currentTarget);$('#clearFilters').onclick=()=>{state.filter=null;state.query='';searchResults=[];state.service='All';$('#searchInput').value='';$$('.quick-tools button').forEach(b=>b.classList.remove('active'));$$('.service').forEach(b=>b.classList.toggle('active',b.dataset.service==='All'));renderRows()};$('#surpriseMe').onclick=()=>openModal(movies[Math.floor(Math.random()*movies.length)].id);$('#modalClose').onclick=()=>{stopTrailer();$('#detailModal').close();document.body.style.overflow=''};$('#detailModal').addEventListener('click',e=>{if(e.target===$('#detailModal')){stopTrailer();$('#detailModal').close();document.body.style.overflow=''}});$('#modalPlay').onclick=()=>openTrailer(state.current);$('#modalList').onclick=()=>toggle(state.watchlist,state.current.id,'My List');$('#modalFavourite').onclick=()=>toggle(state.favourites,state.current.id,'Favourites');$('#modalWatched').onclick=()=>toggle(state.watched,state.current.id,'Watched');$('#savePersonal').onclick=()=>{const id=state.current.id,stateRating=$('#personalRating').value,note=$('#personalNotes').value.trim();if(stateRating)state.ratings[id]=stateRating;else delete state.ratings[id];if(note)state.notes[id]=note;else delete state.notes[id];persist();toast('Your rating and notes were saved')};


function renderStats(){
  $('#contentRows').hidden=true;const panel=$('#statsPanel');panel.hidden=false;
  const watched=[...state.watched].map(id=>movieById.get(id)).filter(Boolean);
  const favourites=[...state.favourites].map(id=>movieById.get(id)).filter(Boolean);
  const rated=Object.values(state.ratings).map(Number).filter(Boolean);
  const avg=rated.length?(rated.reduce((a,b)=>a+b,0)/rated.length).toFixed(1):'—';
  const genreCounts={};watched.forEach(m=>{const g=m.genre.split(' ')[0];genreCounts[g]=(genreCounts[g]||0)+1});
  const topGenre=Object.entries(genreCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Not enough data';
  panel.innerHTML=`<div class="stats-head"><div><div class="eyebrow">YOUR PRISM</div><h2>Viewing statistics</h2><p>Your private activity stays in this browser.</p></div></div><div class="stats-grid"><article><strong>${watched.length}</strong><span>Movies watched</span></article><article><strong>${state.watchlist.size}</strong><span>In My List</span></article><article><strong>${favourites.length}</strong><span>Favourites</span></article><article><strong>${avg}</strong><span>Average personal rating</span></article></div><div class="insight-card"><h3>Your current taste</h3><p>${topGenre==='Not enough data'?'Mark a few films as watched and Prism will begin revealing your viewing patterns.':`Your most-watched style is <strong>${topGenre}</strong>.`}</p></div>`;
}
function populateFilters(){
 const genres=[...new Set(movies.flatMap(m=>m.genre.split(/\s+/)).filter(x=>x.length>3))].sort();
 $('#genreFilter').innerHTML='<option value="All">All genres</option>'+genres.map(g=>`<option value="${g}">${g}</option>`).join('');
}
function cycleTheme(){state.theme=nextTheme(state.theme);applyTheme(state.theme);toast(`${state.theme[0].toUpperCase()+state.theme.slice(1)} theme`)}
function previewBackdrop(id){const m=movies.find(x=>x.id===Number(id));if(!m||state.view!=='home')return;$('#heroMedia').style.backgroundImage=`url('${m.backdrop}')`;}
populateFilters();applyTheme(state.theme);
$('#genreFilter').onchange=e=>{state.genre=e.target.value;renderRows()};
$('#decadeFilter').onchange=e=>{state.decade=e.target.value;renderRows()};
$('#ratingFilter').onchange=e=>{state.minRating=Number(e.target.value);renderRows()};
$('#advancedReset').onclick=()=>{state.genre='All';state.decade='All';state.minRating=0;$('#genreFilter').value='All';$('#decadeFilter').value='All';$('#ratingFilter').value='0';renderRows()};

const discoveryToggle=$('#discoveryToggle'),discoveryPanel=$('#discoveryPanel');
discoveryToggle.onclick=()=>{const open=discoveryToggle.getAttribute('aria-expanded')==='true';discoveryToggle.setAttribute('aria-expanded',String(!open));discoveryPanel.hidden=open};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!discoveryPanel.hidden){discoveryPanel.hidden=true;discoveryToggle.setAttribute('aria-expanded','false');discoveryToggle.focus()}});
$('#themeToggle').onclick=cycleTheme;
const canHover=matchMedia('(hover:hover) and (pointer:fine)').matches;if(canHover)document.addEventListener('mouseover',rafThrottle(e=>{const p=e.target.closest('[data-open]');if(p)previewBackdrop(p.dataset.open)}),{passive:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-collection]');if(c){state.collection=c.dataset.collection;$$('.collection').forEach(b=>b.classList.toggle('active',b===c));renderRows()}});


// Prism 2.0 Founder Mode module
initFounderMode({trigger:$('#founderTrigger'),panel:$('#founderPanel'),close:$('#founderClose'),brand:$('.prism-brand')});


$('#detailModal').addEventListener('close',stopTrailer);

$('#liveDataButton').onclick=loadLiveCatalogue;
$('#dataClose').onclick=()=>$('#dataDialog').close();
$('#dataSave').onclick=async()=>{
  const token=$('#tmdbToken').value.trim();
  if(!token){$('#dataError').textContent='Paste a TMDb API Read Access Token first.';return}

  const previousToken=tmdbToken;
  tmdbToken=token;
  movieService.setToken(token);
  $('#dataSave').disabled=true;
  $('#dataSave').textContent='Connecting…';

  const connected=await loadLiveCatalogue({showDialogOnFailure:true,showToast:true});
  if(connected) {
    writeStorage(TMDB_TOKEN_KEY,token);
    removeStorage('tmdb-token');
  } else {
    tmdbToken=previousToken;
    movieService.setToken(previousToken);
  }

  $('#dataSave').disabled=false;
  $('#dataSave').textContent='Connect TMDb';
};
$('#dataDisconnect').onclick=()=>{removeStorage(TMDB_TOKEN_KEY);removeStorage('tmdb-token');tmdbToken='';location.reload()};

async function initialiseLiveData(){
  $('#tmdbToken').value=tmdbToken;
  if(tmdbToken) {
    await loadLiveCatalogue({showDialogOnFailure:true,showToast:false});
  } else if(!$('#dataDialog').open) {
    $('#dataDialog').showModal();
  }
}

initialiseLiveData();
