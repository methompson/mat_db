import { v4 as uuidv4 } from 'uuid';
import { addIndexedSortKey } from './indexed_sort_keys';
import { addSortedKey } from './sorted_keys';
import { addIndexedKeyPermutations } from './indexed_key_permutations';

/**
 * The data.
 *
 * The data is stored as stringified JSON. The keys are the IDs of the data.
 */
export const theData: Record<string, string> = {};

export function addData(data: string, id?: string | undefined): void {
  const setId = id ?? uuidv4();

  theData[setId] = data;

  // TODO determine which data constructs sort keys
  const mysortKey = 'sortKey';

  addIndexedSortKey(setId, mysortKey);
  addSortedKey(setId, mysortKey);
  addIndexedKeyPermutations(setId, mysortKey);
}
