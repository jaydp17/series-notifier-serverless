/**
 * Contains the types used with trakt API
 */

export interface ITraktIds {
  trakt: number;
  slug: string;
  tvdb: number;
  imdb: string;
  tmdb: number;
  tvrage: number;
}

export interface ITraktShow {
  title: string;
  year: number;
  ids: ITraktIds;
}

export interface ITraktShowFull {
  title: string;
  year: number;
  ids: ITraktIds;
  overview: string;
  first_aired: string;
  trailer: string;
  status: string;
  rating: number;
  genres: string[];
}

export interface ITraktSearchResult {
  type: 'show'; // tslint:disable-line:no-reserved-keywords
  score: number | null;
  show: ITraktShowFull;
}

export interface ITraktTrendingResult {
  watchers: number;
  show: ITraktShow;
}

export interface ITraktEpisode {
  season: number;
  number: number; // tslint:disable-line:no-reserved-keywords
  title: string;
  ids: ITraktIds;
}

export interface ITraktEpisodeFull {
  season: number;
  number: number; // tslint:disable-line:no-reserved-keywords
  title: string;
  ids: ITraktIds;
  overview: string;
  rating: number;
  first_aired: string;
  runtime: number;
}
