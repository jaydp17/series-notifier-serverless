/**
 * Trending Controller
 */

import { prettyPrint } from '../../common/common-utils';
import { convertToITvShow } from '../action-helper';
import * as TraktApi from '../apis/trakt.api';
import { _getBackDropUrls } from './search.controller';

// types
import * as InternalTypes from '../../common/internal-message-types';
import * as TraktType from '../apis/trakt.types';

export async function getTrending(): Promise<InternalTypes.ITvShow[]> {
  const trendingResults = await TraktApi.showTrending();
  const trendingImdbIds = trendingResults.map(result => result.show.ids.imdb);

  const traktShowsPromises: Promise<TraktType.ITraktSearchResult | undefined>[] = trendingImdbIds.map(imdbId =>
    TraktApi.searchByImdbId(imdbId).catch(err => {
      console.error(`Error while fetching TraktApi.searchByImdbId(${imdbId})`);
      console.error(err);
    }),
  );
  const backDropPromises = _getBackDropUrls(trendingImdbIds);
  const [backdropUrlMap, trackShowsWithNull] = await Promise.all([backDropPromises, Promise.all(traktShowsPromises)]);
  const traktShows = <TraktType.ITraktSearchResult[]>trackShowsWithNull.filter(show => !!show);

  return traktShows
    .map(({ show }) => show)
    .map(show => convertToITvShow(show))
    .map(show => ({ ...show, backDropUrl: backdropUrlMap[show.imdbId] }))
    .filter(show => !!show.backDropUrl); // keep shows with backdrop only;
}
