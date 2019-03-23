/**
 * Tests Next Episode Controller
 */

jest.mock('../apis/trakt.api');
jest.mock('../../models/next-episode-cache');

import { mocked } from 'ts-jest/utils';
import { getTvEpisode } from '../../../test/test-data/common.data';
import { getTraktEpisode, getTraktEpisodeFull } from '../../../test/test-data/trakt.data';
import * as InternalTypes from '../../common/internal-message-types';
import * as NextEpisodeCacheModel from '../../models/next-episode-cache';
import * as TraktAPI from '../apis/trakt.api';
import * as NextEpisodeController from './next-episode.controller';

describe('Next Episode Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('gets next episode', async () => {
    // prepare
    const originalImdbId = 'tt122';
    const expectedNextEp = getTraktEpisode({ imdbId: originalImdbId });
    const expectedFullEpisode = getTraktEpisodeFull({ imdbId: originalImdbId });
    mocked(TraktAPI.nextEpisode).mockImplementationOnce(() => expectedNextEp);
    mocked(TraktAPI.episodeSummary).mockImplementationOnce(() => expectedFullEpisode);
    const nextEpisode: InternalTypes.ITvEpisode = {
      seasonNumber: expectedFullEpisode.season,
      epNumber: expectedFullEpisode.number,
      title: expectedFullEpisode.title,
      tvdbId: expectedFullEpisode.ids.tvdb,
      imdbId: expectedFullEpisode.ids.imdb,
      overview: expectedFullEpisode.overview,
      rating: expectedFullEpisode.rating,
      firstAired: new Date(expectedFullEpisode.first_aired).getTime() || null,
      runtime: expectedFullEpisode.runtime,
    };

    // execute
    const result = await NextEpisodeController.getNextEpisode(originalImdbId);

    // test
    expect(result).toEqual(nextEpisode);
    expect(TraktAPI.nextEpisode).toHaveBeenCalledTimes(1);
    expect(TraktAPI.episodeSummary).toHaveBeenCalledTimes(1);
    expect(NextEpisodeCacheModel.updateCache).toHaveBeenCalledTimes(1);

    expect(TraktAPI.nextEpisode).toHaveBeenCalledWith(originalImdbId);
    expect(TraktAPI.episodeSummary).toHaveBeenCalledWith(originalImdbId, expectedNextEp.season, expectedNextEp.number);
    expect(NextEpisodeCacheModel.updateCache).toHaveBeenCalledWith(originalImdbId, nextEpisode);
  });

  it('gets next episode from cache', async () => {
    // prepare
    const originalImdbId = 'tt123';
    const nextEpisode: InternalTypes.ITvEpisode = getTvEpisode({ imdbId: originalImdbId });
    mocked(NextEpisodeCacheModel.getCache).mockImplementationOnce(async () => nextEpisode);

    // execute
    const result = await NextEpisodeController.getNextEpisode(originalImdbId);

    // test
    expect(result).toEqual(nextEpisode);
    expect(TraktAPI.nextEpisode).not.toHaveBeenCalled();
    expect(TraktAPI.episodeSummary).not.toHaveBeenCalled();
    expect(NextEpisodeCacheModel.updateCache).not.toHaveBeenCalled();
  });

  it('gets next episode with skipCache = 1', async () => {
    // prepare
    const originalImdbId = 'tt124';
    const nextEpisodeCache: InternalTypes.ITvEpisode = getTvEpisode({ imdbId: originalImdbId });
    mocked(NextEpisodeCacheModel.getCache).mockImplementationOnce(async () => nextEpisodeCache);
    const expectedNextEp = getTraktEpisode({ imdbId: originalImdbId });
    const expectedFullEpisode = getTraktEpisodeFull({ imdbId: originalImdbId });
    mocked(TraktAPI.nextEpisode).mockImplementationOnce(() => expectedNextEp);
    mocked(TraktAPI.episodeSummary).mockImplementationOnce(() => expectedFullEpisode);
    const nextEpisode: InternalTypes.ITvEpisode = {
      seasonNumber: expectedFullEpisode.season,
      epNumber: expectedFullEpisode.number,
      title: expectedFullEpisode.title,
      tvdbId: expectedFullEpisode.ids.tvdb,
      imdbId: expectedFullEpisode.ids.imdb,
      overview: expectedFullEpisode.overview,
      rating: expectedFullEpisode.rating,
      firstAired: new Date(expectedFullEpisode.first_aired).getTime() || null,
      runtime: expectedFullEpisode.runtime,
    };

    // execute
    const result = await NextEpisodeController.getNextEpisode(originalImdbId, { skipCacheRead: true });

    // test
    expect(result).toEqual(nextEpisode);
    expect(NextEpisodeCacheModel.getCache).not.toHaveBeenCalled();
    expect(TraktAPI.nextEpisode).toHaveBeenCalled();
    expect(TraktAPI.episodeSummary).toHaveBeenCalled();
    expect(NextEpisodeCacheModel.updateCache).toHaveBeenCalled();
  });
});
