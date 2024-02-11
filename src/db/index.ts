/**
 * The data.
 *
 * The data is stored as stringified JSON. The keys are the IDs of the data.
 */
export const data: Record<string, string> = {};

/**
 * The indexed sort keys.
 *
 * This map has the sort keys as keys and all IDs that have that sort key as
 * values.
 */
export const indexedData: Record<string, string[]> = {};

/**
 * The indexed key permutations
 *
 * We calculate all permutations of a sort key from 3 characters all the way
 * to the length of the sort key. Each permutation key is a key of the hash
 * map and the value is an array of IDs that have that permutation.
 */
export const indexedPermutationData: Record<string, string[]> = {};

interface SortedKeyData {
  key: string;
  id: string[];
}
/**
 * The alphabetically sorted keys
 *
 * All the sort keys are sorted in alphabetical order. This allows us to
 * perform Greater Than, Less Than, and between operations.
 */
export const sortedKeys: SortedKeyData[] = [];
