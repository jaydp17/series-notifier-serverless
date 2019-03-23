/**
 * Trending Controller
 */

import * as InternalTypes from '../../common/internal-message-types';
import * as Subscription from '../../models/subscription';
import * as TraktApi from '../apis/trakt.api';
import * as SearchController from '../controllers/search.controller';

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
        // tslint:disable-next-line: no-console
        console.error(`Error while fetching TraktApi.searchByImdbId(${imdbId})`);
        // tslint:disable-next-line: no-console
        console.error(err);
      }),
    ),
  );

  return traktShowsWithNull.filter(show => show && show.backDropUrl) as InternalTypes.ITvShow[]; // keep shows with backdrop only;
}
