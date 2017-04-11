/**
 * All the types from themoviedb
 */

export interface IFindTvResult {
  backdrop_path: string;
  first_air_date: string;
  id: number;
  overview: string;
  poster_path: string;
  name: string;
}

export interface IFindResult {
  movie_results: {}[],
  person_results: {}[],
  tv_results: IFindTvResult[],
  tv_episode_results: {}[],
  tv_season_results: {}[],
}
