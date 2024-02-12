/**
 * The indexed key permutations
 *
 * We calculate all permutations of a sort key from 3 characters all the way
 * to the length of the sort key. Each permutation key is a key of the hash
 * map and the value is an array of IDs that have that permutation.
 */
export const indexedKeyPermutations: Record<string, Set<string>> = {};

export function addIndexedKeyPermutations(id: string, sortKey: string): void {
  for (let i = 3; i <= sortKey.length; i++) {
    const key = sortKey.substring(0, i);
    const index = indexedKeyPermutations[key] ?? new Set();
    index.add(id);
    indexedKeyPermutations[key] = index;
  }
}

export function beginsWithQuery(beginsWith: string) {
  const record = indexedKeyPermutations[beginsWith] ?? new Set();
  return [...record.values()];
}
