/**
 * The indexed sort keys.
 *
 * This map has the sort keys as keys and all IDs that have that sort key as
 * values.
 */
export const indexedSortKeys: Record<string, Set<string>> = {};

export function addIndexedSortKey(id: string, sortKey: string): void {
  const sortKeys = indexedSortKeys[sortKey] ?? new Set<string>();

  sortKeys.add(id);

  indexedSortKeys[sortKey] = sortKeys;
}
