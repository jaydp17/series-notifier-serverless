/**
 * Generates common test data
 */

import { random } from 'faker';
import { platformNames } from '../../src/common/constants';

export function getSocialId(): string {
  return `${platformNames.FBMessenger}::${random.number()}`;
}
