import { addIndexedSortKey, indexedSortKeys } from './indexed_sort_keys';

describe('addIndexedSortKey', () => {
  beforeEach(() => {
    Object.keys(indexedSortKeys).forEach((k) => {
      delete indexedSortKeys[k];
    });
  });

  test('Adding a sort key adds the id to the sort key', () => {
    addIndexedSortKey('id', 'sortKey');

    const key = indexedSortKeys.sortKey;
    expect(Object.keys(indexedSortKeys)).toEqual(['sortKey']);
    expect(key).not.toBeUndefined();
    expect([...(key?.values() ?? [])]).toEqual(['id']);
  });

  test('Adding a sort key with the same id does not add the id again', () => {
    addIndexedSortKey('id', 'sortKey');
    addIndexedSortKey('id', 'sortKey');

    expect(Object.keys(indexedSortKeys)).toEqual(['sortKey']);
    expect([...(indexedSortKeys['sortKey']?.values() ?? [])]).toEqual(['id']);
  });

  test('adding another sort key adds it to the list', () => {
    addIndexedSortKey('id', 'sortKey');
    addIndexedSortKey('id2', 'sortKey2');

    expect(Object.keys(indexedSortKeys)).toEqual(['sortKey', 'sortKey2']);
    expect([...(indexedSortKeys['sortKey']?.values() ?? [])]).toEqual(['id']);
    expect([...(indexedSortKeys['sortKey2']?.values() ?? [])]).toEqual(['id2']);
  });

  test('adding another id with the same sort key adds it to the list', () => {
    addIndexedSortKey('id', 'sortKey');
    addIndexedSortKey('id2', 'sortKey');

    expect(Object.keys(indexedSortKeys)).toEqual(['sortKey']);
    expect([...(indexedSortKeys['sortKey']?.values() ?? [])]).toEqual([
      'id',
      'id2',
    ]);
  });
});
