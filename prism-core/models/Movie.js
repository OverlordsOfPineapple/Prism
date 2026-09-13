const EMPTY_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=88';

const freezeArray = value => Object.freeze(Array.isArray(value) ? value : []);
const freezeObject = value => Object.freeze(value && typeof value === 'object' ? value : {});

/** Canonical provider-agnostic Prism movie entity. */
export class Movie {
  constructor(input = {}) {
    this.kind = 'movie';
    this.basic = freezeObject({
      id: Number(input.basic?.id ?? input.id),
      title: input.basic?.title ?? input.title ?? 'Untitled',
      originalTitle: input.basic?.originalTitle ?? input.originalTitle ?? '',
      overview: input.basic?.overview ?? input.overview ?? '',
      releaseDate: input.basic?.releaseDate ?? input.releaseDate ?? '',
      year: input.basic?.year ?? input.year ?? null,
      runtimeMinutes: input.basic?.runtimeMinutes ?? input.runtimeMinutes ?? null,
      classification: input.basic?.classification ?? input.classification ?? 'Unrated',
      genres: freezeArray(input.basic?.genres ?? input.genres),
      language: input.basic?.language ?? input.language ?? '',
      status: input.basic?.status ?? input.status ?? '',
    });
    this.artwork = freezeObject({
      poster: input.artwork?.poster ?? input.poster ?? EMPTY_IMAGE,
      backdrop: input.artwork?.backdrop ?? input.backdrop ?? input.artwork?.poster ?? input.poster ?? EMPTY_IMAGE,
      logos: freezeArray(input.artwork?.logos),
      posters: freezeArray(input.artwork?.posters),
      backdrops: freezeArray(input.artwork?.backdrops),
    });
    this.credits = freezeObject({
      director: input.credits?.director ?? input.director ?? 'Not listed',
      cast: freezeArray(input.credits?.cast ?? input.cast),
      crew: freezeArray(input.credits?.crew),
      studios: freezeArray(input.credits?.studios ?? input.studios),
    });
    this.providers = freezeObject({
      region: input.providers?.region ?? 'AU',
      link: input.providers?.link ?? input.providerLink ?? '',
      streaming: freezeArray(input.providers?.streaming ?? input.streamingProviders ?? input.providers),
      subscription: freezeArray(input.providers?.subscription),
      free: freezeArray(input.providers?.free),
      ads: freezeArray(input.providers?.ads),
      rent: freezeArray(input.providers?.rent),
      buy: freezeArray(input.providers?.buy),
    });
    this.ratings = freezeObject({
      tmdb: input.ratings?.tmdb ?? input.score ?? null,
      voteCount: input.ratings?.voteCount ?? input.voteCount ?? 0,
      popularity: input.ratings?.popularity ?? input.popularity ?? 0,
      external: freezeObject(input.ratings?.external),
    });
    this.media = freezeObject({
      trailerId: input.media?.trailerId ?? input.trailerId ?? '',
      videos: freezeArray(input.media?.videos),
    });
    this.recommendations = freezeArray(input.recommendations);
    this.similar = freezeArray(input.similar);
    this.collection = input.collection ?? null;
    this.external = freezeObject(input.external);
    this.release = freezeObject(input.release);
    this.statistics = freezeObject(input.statistics);
    this.discovery = freezeObject({ rows: freezeArray(input.discovery?.rows ?? input.rows) });
    this.meta = freezeObject({
      source: input.meta?.source ?? input.source ?? 'unknown',
      enriched: Boolean(input.meta?.enriched ?? input.enriched),
      fetchedAt: input.meta?.fetchedAt ?? new Date().toISOString(),
    });
    Object.freeze(this);
  }

  // Compatibility accessors keep the cinematic UI independent of provider payloads.
  get id() { return this.basic.id; }
  get title() { return this.basic.title; }
  get overview() { return this.basic.overview; }
  get year() { return this.basic.year; }
  get classification() { return this.basic.classification; }
  get runtime() { const m=this.basic.runtimeMinutes; return m ? `${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m` : 'Runtime pending'; }
  get genre() { return this.basic.genres.map(g => typeof g === 'string' ? g : g.name).join(' · ') || 'Film'; }
  get poster() { return this.artwork.poster; }
  get backdrop() { return this.artwork.backdrop; }
  get director() { return this.credits.director; }
  get cast() { return this.credits.cast; }
  get studios() { return this.credits.studios; }
  get providersList() { return this.providers.streaming; }
  get providerLink() { return this.providers.link; }
  get imdb() { return Number.isFinite(this.ratings.tmdb) ? this.ratings.tmdb.toFixed(1) : '—'; }
  get voteCount() { return this.ratings.voteCount; }
  get popularity() { return this.ratings.popularity; }
  get trailerId() { return this.media.trailerId; }
  get rows() { return this.discovery.rows; }
  get source() { return this.meta.source; }
  get enriched() { return this.meta.enriched; }
  get releaseLabel() { return this.basic.releaseDate ? new Date(`${this.basic.releaseDate}T00:00:00`).toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'}) : 'Release pending'; }

  with(patch = {}) {
    const merged = {
      ...this,
      ...patch,
      basic: {...this.basic, ...patch.basic}, artwork: {...this.artwork, ...patch.artwork},
      credits: {...this.credits, ...patch.credits}, providers: {...this.providers, ...patch.providers},
      ratings: {...this.ratings, ...patch.ratings}, media: {...this.media, ...patch.media},
      discovery: {...this.discovery, ...patch.discovery}, meta: {...this.meta, ...patch.meta},
    };
    return new Movie(merged);
  }
}
