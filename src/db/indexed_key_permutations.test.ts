import {
  addIndexedKeyPermutations,
  beginsWithQuery,
  indexedKeyPermutations,
} from './indexed_key_permutations';

describe('addIndexedKeyPermutations', () => {
  beforeEach(() => {
    Object.keys(indexedKeyPermutations).forEach((k) => {
      delete indexedKeyPermutations[k];
    });
  });

  test('adds a key in an expected place', () => {
    addIndexedKeyPermutations('id', 'sortKey');

    expect(Object.keys(indexedKeyPermutations)).toEqual([
      'sor',
      'sort',
      'sortK',
      'sortKe',
      'sortKey',
    ]);
    expect(Object.keys(indexedKeyPermutations).length).toBe(5);

    expect([...(indexedKeyPermutations['sor']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sort']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortK']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortKe']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortKey']?.values() ?? [])]).toEqual([
      'id',
    ]);
  });

  test('adding multiple keys adds them in expected places', () => {
    addIndexedKeyPermutations('id', 'sortKey');
    addIndexedKeyPermutations('id2', 'sortKey2');

    expect(Object.keys(indexedKeyPermutations)).toEqual([
      'sor',
      'sort',
      'sortK',
      'sortKe',
      'sortKey',
      'sortKey2',
    ]);
    expect(Object.keys(indexedKeyPermutations).length).toBe(6);

    expect([...(indexedKeyPermutations['sor']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
    expect([...(indexedKeyPermutations['sort']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
    expect([...(indexedKeyPermutations['sortK']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
    expect([...(indexedKeyPermutations['sortKe']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
    expect([...(indexedKeyPermutations['sortKey']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
    expect([...(indexedKeyPermutations['sortKey2']?.values() ?? [])]).toEqual([
      'id2',
    ]);
  });

  test('Adding a key with the same sort key and id does not add the id again', () => {
    addIndexedKeyPermutations('id', 'sortKey');
    addIndexedKeyPermutations('id', 'sortKey');

    expect(Object.keys(indexedKeyPermutations)).toEqual([
      'sor',
      'sort',
      'sortK',
      'sortKe',
      'sortKey',
    ]);
    expect(Object.keys(indexedKeyPermutations).length).toBe(5);

    expect([...(indexedKeyPermutations['sor']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sort']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortK']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortKe']?.values() ?? [])]).toEqual([
      'id',
    ]);
    expect([...(indexedKeyPermutations['sortKey']?.values() ?? [])]).toEqual([
      'id',
    ]);
  });
});

describe('beginsWithQuery', () => {
  test('returns an empty array when the key does not exist', () => {
    addIndexedKeyPermutations('id', 'sortKey');

    expect(beginsWithQuery('does not exist')).toEqual([]);
  });

  test('returns all indexes that start with the given key', () => {
    addIndexedKeyPermutations('id', 'sortKey');
    addIndexedKeyPermutations('id2', 'sortKey2');

    expect(beginsWithQuery('sort')).toEqual(['id', 'id2']);
  });
});
