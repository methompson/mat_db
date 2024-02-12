import { isUndefinedOrNull } from '@/src/utils/type_guards';

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

export function greaterThanQuery(greaterThan: string): SortedKeyData[] {
  const index = sortedKeys.findIndex((key) => key.key > greaterThan);
  if (index < 0) {
    return [];
  }

  return sortedKeys.slice(index);
  // return sortedKeys.slice(index).flatMap((key) => key.id);
}

export function greaterThanEqualQuery(greaterThanEqual: string) {
  const index = sortedKeys.findIndex((key) => key.key >= greaterThanEqual);

  if (index < 0) {
    return [];
  }

  return sortedKeys.slice(index);
  // return sortedKeys.slice(index).flatMap((key) => key.id);
}

export function lessThanQuery(lessThan: string) {
  const index = sortedKeys.findIndex((key) => key.key >= lessThan);

  if (index < 0) {
    return sortedKeys.slice();
  }

  return sortedKeys.slice(0, index);
  // return sortedKeys.slice(0, index).flatMap((key) => key.id);
}

export function lessThanEqualQuery(lessThanEqual: string) {
  const index = sortedKeys.findIndex((key) => key.key > lessThanEqual);

  if (index < 0) {
    return sortedKeys.slice();
  }

  return sortedKeys.slice(0, index);
  // return sortedKeys.slice(0, index).flatMap((key) => key.id);
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
  const startIndex = sortedKeys.findIndex((key) => key.key >= startKey);
  const endIndex = sortedKeys.findIndex((key) => key.key > endKey);

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
  // return sortedKeys.slice(startIndex, endIndex).flatMap((key) => key.id);
}
