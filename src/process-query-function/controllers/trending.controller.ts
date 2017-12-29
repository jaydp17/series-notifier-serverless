/**
 * Trending Controller
 */

import { prettyPrint } from '../../common/common-utils';
import * as Subscription from '../../models/subscription';
import { convertToITvShow } from '../action-helper';
import * as TraktApi from '../apis/trakt.api';
import * as SearchController from '../controllers/search.controller';
import { _getBackDropUrls } from './search.controller';

// types
import * as InternalTypes from '../../common/internal-message-types';
import * as TraktType from '../apis/trakt.types';

export async function getTrending(socialId: string): Promise<InternalTypes.ITvShow[]> {
  const [trendingResults, subscriptionRecords] = await Promise.all([
    TraktApi.showTrending(),
    Subscription.getSubscribedShows(socialId),
  ]);
  const subscribedImdbIds = subscriptionRecords.map(record => record.imdbId);
  const trendingImdbIds = trendingResults.map(result => result.show.ids.imdb);

  const traktShowsWithNull = await Promise.all(
    trendingImdbIds.map(imdbId =>
      SearchController.searchByImdb(imdbId, subscribedImdbIds.includes(imdbId)).catch(err => {
        console.error(`Error while fetching TraktApi.searchByImdbId(${imdbId})`);
        console.error(err);
      }),
    ),
  );

  return <InternalTypes.ITvShow[]>traktShowsWithNull.filter(show => show && show.backDropUrl); // keep shows with backdrop only;
}
