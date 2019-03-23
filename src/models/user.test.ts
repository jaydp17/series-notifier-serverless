/**
 * Tests for User Model
 */

jest.mock('../common/dynamodb.ts');

// mocks
import dynamodb from '../common/dynamodb';

// imports
import { platformNames } from '../common/constants';
import tables from '../common/tables';
import * as UserModel from './user';

const TableName = tables.names.users; // tslint:disable-line:variable-name

describe('User Model', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('tests isValidSocialId', () => {
    // prepare
    const cases: Array<{ input?: string | null; output: boolean }> = [
      { input: undefined, output: false },
      { input: null, output: false },
      { input: '', output: false },
      { input: 'abc', output: false },
      { input: '::abc', output: false },
      { input: 'abc::123', output: false },
      { input: 'abc::', output: false },
      { input: `${platformNames.FBMessenger}::`, output: false },
    ];
    const platforms = Object.values(platformNames);
    for (const platform of platforms) {
      cases.push({ input: `${platform}::32424`, output: true });
    }

    // test
    for (const row of cases) {
      const result = UserModel.isValidSocialId(row.input);
      expect(result).toEqual(row.output);
    }
  });

  describe('create user', () => {
    it('throws error on invalid socialId', () => {
      const socialId = 'asdf';
      expect(() => {
        UserModel.createUser(socialId);
      }).toThrowError(/Invalid socialId/);
    });

    it('creates a new user', async () => {
      // prepare
      const socialId = `${platformNames.FBMessenger}::123`;
      const expectedResult = { Item: { socialId }, TableName };

      // execute
      await UserModel.createUser(socialId);

      // test
      expect(dynamodb.put).toBeCalledWith(expectedResult);
    });
  });

  it('gets a user', async () => {
    // prepare
    const socialId = `${platformNames.FBMessenger}::123`;
    const expectedResult = { Key: { socialId }, TableName };

    // execute
    await UserModel.getUser(socialId);

    // test
    expect(dynamodb.get).toBeCalledWith(expectedResult);
  });
});
