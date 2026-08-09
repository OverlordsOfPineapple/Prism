export function assertMovieConnector(connector) {
  for (const method of ['getTrendingMovies','searchMovies','getMovie']) {
    if (typeof connector?.[method] !== 'function') throw new TypeError(`Movie connector must implement ${method}()`);
  }
  return connector;
}
