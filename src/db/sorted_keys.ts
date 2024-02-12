import { isUndefinedOrNull } from '@/src/utils/type_guards';
import { arrayToObject } from '@/src/utils/array_to_obj';

interface SortedKeyData {
  key: string;
  id: Set<string>;
}

/**
 * The alphabetically sorted keys
 *
 * All the sort keys are sorted in alphabetical order. This allows us to
 * perform Greater Than, Less Than, and between operations.
 */
export const sortedKeys: SortedKeyData[] = [];

export function addSortedKey(id: string, sortKey: string): void {
  const existingValue = sortedKeys.find((key) => key.key === sortKey);
  if (existingValue) {
    existingValue.id.add(id);
    return;
  }

  sortedKeys.push({ key: sortKey, id: new Set([id]) });
  sortedKeys.sort((a, b) => a.key.localeCompare(b.key));
}

export function bulkAddSortedKey(add: { id: string; key: string }[]): void {
  const mappedResults = arrayToObject(sortedKeys, (item) => item.key);

  add.forEach((item) => {
    const data = mappedResults[item.key] ?? { key: item.key, id: new Set() };
    data.id.add(item.id);
    mappedResults[item.key] = data;
  });

  const arrayData = Object.values(mappedResults);

  arrayData.sort((a, b) => a.key.localeCompare(b.key));

  // Actually clears the array
  sortedKeys.length = 0;

  for (const item of arrayData) {
    sortedKeys.push(item);
  }
}

export function findIndexRecursive(
  key: string,
  equal: boolean,
  lowerBound: number,
  upperBound: number,
): number {
  const middle = Math.floor((upperBound + lowerBound) / 2);

  const foundKey = sortedKeys[middle]?.key;

  if (isUndefinedOrNull(foundKey)) {
    throw new Error('Out of bounds');
  }

  if (foundKey === key) {
    return middle;
  }

  if (lowerBound === upperBound) {
    return -1;
  }

  const op = equal ? foundKey >= key : foundKey > key;

  if (op) {
    return findIndexRecursive(key, equal, lowerBound, middle);
  }

  return findIndexRecursive(key, equal, middle + 1, upperBound);
}

export function findIndex(key: string, equal: boolean): number {
  // If we're less than 100 keys long, we can just use findIndex and probably
  // have fewer ops and be faster. Anything more and we can probably reduce
  // the number of ops by using a binary search
  if (sortedKeys.length < 100) {
    const op = equal
      ? (k: SortedKeyData) => k.key >= key
      : (k: SortedKeyData) => k.key > key;

    return sortedKeys.findIndex((k) => op(k));
  }

  return findIndexRecursive(key, equal, 0, sortedKeys.length - 1);
}

export function greaterThanQuery(greaterThan: string): SortedKeyData[] {
  const index = findIndex(greaterThan, false);
  if (index < 0) {
    return [];
  }

  return sortedKeys.slice(index);
}

export function greaterThanEqualQuery(greaterThanEqual: string) {
  const index = findIndex(greaterThanEqual, true);

  if (index < 0) {
    return [];
  }

  return sortedKeys.slice(index);
}

export function lessThanQuery(lessThan: string) {
  const index = findIndex(lessThan, true);
  // const index = sortedKeys.findIndex((key) => key.key >= lessThan);

  if (index < 0) {
    return sortedKeys.slice();
  }

  return sortedKeys.slice(0, index);
}

export function lessThanEqualQuery(lessThanEqual: string) {
  const index = findIndex(lessThanEqual, false);

  if (index < 0) {
    return sortedKeys.slice();
  }

  return sortedKeys.slice(0, index);
}

export function betweenQuery(start: string, end: string) {
  let startKey: string, endKey: string;
  if (start > end) {
    startKey = end;
    endKey = start;
  } else {
    startKey = start;
    endKey = end;
  }
  const startIndex = findIndex(startKey, true);
  const endIndex = findIndex(endKey, false);
  // const startIndex = sortedKeys.findIndex((key) => key.key >= startKey);
  // const endIndex = sortedKeys.findIndex((key) => key.key > endKey);

  if (startIndex < 0) {
    return [];
  }

  if (endIndex < 0) {
    return sortedKeys.slice(startIndex);
  }

  if (startIndex === 0 && endIndex === 0) {
    const zeroResult = sortedKeys[0];

    // If it doesn't exist, return an empty array
    if (isUndefinedOrNull(zeroResult)) {
      return [];
    }

    // If the key is greater than the start key, return an empty array. Zero
    // index is greater than the key
    if (zeroResult.key > endKey) {
      return [];
    }

    return [zeroResult];
  }

  return sortedKeys.slice(startIndex, endIndex);
}
