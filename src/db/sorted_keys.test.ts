import {
  addSortedKey,
  betweenQuery,
  bulkAddSortedKey,
  findIndexRecursive,
  greaterThanEqualQuery,
  greaterThanQuery,
  lessThanEqualQuery,
  lessThanQuery,
  sortedKeys,
} from './sorted_keys';

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function benchmark(iterations: number) {
  const startId = 40;
  const data: { id: string; key: string }[] = [];
  const needle = `value#${Math.round(iterations / 2 + iterations * 0.1)}`;

  for (let i = 0; i < iterations; i++) {
    data.push({ id: `id${startId + i}`, key: `value#${i}` });
  }

  bulkAddSortedKey(data);

  const startA = performance.now();
  const index = findIndexRecursive(needle, true, 0, sortedKeys.length - 1);
  const endA = performance.now();

  const startB = performance.now();
  const expectedIndex = sortedKeys.findIndex((key) => key.key === needle);
  const endB = performance.now();

  const faster = endA - startA < endB - startB ? 'custom' : 'builtIn';

  console.log({
    dataSet: `${iterations} record data set`,
    custom: `${(endA - startA).toFixed(4)}ms`,
    builtIn: `${(endB - startB).toFixed(4)}ms`,
    faster,
  });

  expect(index).toBe(expectedIndex);
}

describe('sortedKeys', () => {
  beforeEach(() => {
    while (sortedKeys.length > 0) {
      sortedKeys.pop();
    }
  });

  describe('addSortedKeys', () => {
    test('Adding a sort key adds it to the sortedKey array', () => {
      addSortedKey('id', 'sortKey');
      expect(sortedKeys.length).toBe(1);

      const key = sortedKeys[0];
      expect(key).not.toBeUndefined();
      expect(key?.key).toBe('sortKey');
      expect([...(key?.id.values() ?? [])]).toEqual(['id']);
    });

    test('adding a sort key that already exists does not replace or add the key again', () => {
      addSortedKey('id', 'sortKey');
      addSortedKey('id2', 'sortKey');
      expect(sortedKeys.length).toBe(1);

      const key = sortedKeys[0];
      expect(key).not.toBeUndefined();
      expect(key?.key).toBe('sortKey');
      expect([...(key?.id.values() ?? [])]).toEqual(['id', 'id2']);
    });

    test('adding a sort key that does not exist adds it to the sortedKey array', () => {
      addSortedKey('id1', 'sortKey1');
      addSortedKey('id2', 'sortKey2');

      expect(sortedKeys.length).toBe(2);

      const key1 = sortedKeys[0];
      expect(key1).not.toBeUndefined();
      expect(key1?.key).toBe('sortKey1');
      expect([...(key1?.id.values() ?? [])]).toEqual(['id1']);

      const key2 = sortedKeys[1];
      expect(key2).not.toBeUndefined();
      expect(key2?.key).toBe('sortKey2');
      expect([...(key2?.id.values() ?? [])]).toEqual(['id2']);
    });
  });

  describe('date dependent tests', () => {
    beforeEach(() => {
      let someDate = new Date('2021-01-01');

      // Should be January 1, 2021 through January 30, 2021
      for (let i = 0; i < 30; i++) {
        const dateString = someDate.toISOString().slice(0, 10);
        someDate = new Date(someDate.getTime() + ONE_DAY_IN_MILLISECONDS);
        addSortedKey(`id${i}`, `punch#${dateString}`);
      }
    });

    describe('findIndexRecursive', () => {
      test('returns the index of the key when the key exists (lower bound)', () => {
        const index = findIndexRecursive(
          'punch#2021-01-15',
          true,
          0,
          sortedKeys.length,
        );

        expect(index).toBe(14);
      });

      test('returns the index of the key when the key exists (upper bound)', () => {
        const keyToFind = 'punch#2021-01-22';
        const index = findIndexRecursive(
          keyToFind,
          true,
          0,
          sortedKeys.length - 1,
        );
        const expectedIndex = sortedKeys.findIndex(
          (key) => key.key === keyToFind,
        );

        expect(index).toBe(expectedIndex);
      });

      test('returns the index of the key when the key exists and it is the first key', () => {
        const index = findIndexRecursive(
          'punch#2021-01-01',
          true,
          0,
          sortedKeys.length - 1,
        );
        expect(index).toBe(0);
      });

      test('returns the index of the key when the key exists and it is the last key', () => {
        const index = findIndexRecursive(
          'punch#2021-01-30',
          true,
          0,
          sortedKeys.length - 1,
        );
        expect(index).toBe(29);
      });

      test('returns the index of the key when the key does not exist', () => {
        const index = findIndexRecursive(
          'punch#2021-01-31',
          true,
          0,
          sortedKeys.length - 1,
        );
        expect(index).toBe(-1);
      });

      // Performance is tricky to test. If just this test is run, the built-in
      // findIndex is faster. If all tests are run, the custom findIndex is
      // faster. Presumably, this is due to JIT optimizations.
      test('performance check tiny data set', () => {
        benchmark(100);
      });

      test('performance check small data set', () => {
        benchmark(1000);
      });

      test('performance check large data set', () => {
        benchmark(100000);
      });

      test('performance check giant data set', () => {
        benchmark(1000000);
      });
    });

    describe('greaterThanQuery', () => {
      test('returns all keys greater than the given key', () => {
        const result = greaterThanQuery('punch#2021-01-15');

        expect(result.length).toBe(15);

        expect(result).toEqual([
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns all results if the key is less than the first key', () => {
        const result = greaterThanQuery('punch#2020-12-31');

        expect(result.length).toBe(30);
        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns a value that is greater even if its first character is not the same as the query', () => {
        addSortedKey('another_id', 'shift#2019-01-01');
        const result = greaterThanQuery('punch#2021-01-29');
        expect(result.length).toBe(2);
        expect(result).toEqual([
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
          { key: 'shift#2019-01-01', id: new Set(['another_id']) },
        ]);
      });

      test('Does not return the key that is equal to the query', () => {
        const result = greaterThanQuery('punch#2021-01-30');
        expect(result.length).toBe(0);
      });

      test("returns an empty array when the key does not exist and it's after the last key", () => {
        const result = greaterThanQuery('shift#2021-01-02');
        expect(result.length).toBe(0);
      });

      test('returns an empty array when the greaterThan key is after the last key', () => {
        const result = greaterThanQuery('shift#2021-01-31');
        expect(result.length).toBe(0);
      });
    });

    describe('greaterThanEqualQuery', () => {
      test('returns all keys greater or equal to the given key', () => {
        const result = greaterThanEqualQuery('punch#2021-01-15');

        expect(result.length).toBe(16);

        expect(result).toEqual([
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns all results if the key is less than the first key', () => {
        const result = greaterThanEqualQuery('punch#2020-12-31');

        expect(result.length).toBe(30);
        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns a value that is greater even if its first character is not the same as the query', () => {
        addSortedKey('another_id', 'shift#2019-01-01');
        const result = greaterThanEqualQuery('punch#2021-01-29');
        expect(result.length).toBe(3);
        expect(result).toEqual([
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
          { key: 'shift#2019-01-01', id: new Set(['another_id']) },
        ]);
      });

      test('returns the key that is equal to the query', () => {
        const result = greaterThanEqualQuery('punch#2021-01-30');
        expect(result.length).toBe(1);
        expect(result).toEqual([
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test("returns an empty array when the key does not exist and it's after the last key", () => {
        const result = greaterThanEqualQuery('shift#2021-01-02');
        expect(result.length).toBe(0);
      });

      test('returns an empty array when the greaterThan key is after the last key', () => {
        const result = greaterThanEqualQuery('shift#2021-01-31');
        expect(result.length).toBe(0);
      });
    });

    describe('lessThanQuery', () => {
      test('returns all keys less than the given key', () => {
        const result = lessThanQuery('punch#2021-01-15');

        expect(result.length).toBe(14);

        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
        ]);
      });

      test('returns all results if the key is greater than the last key', () => {
        const result = lessThanQuery('punch#2021-12-31');

        expect(result.length).toBe(30);
        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns a value that is less even if its first character is not the same as the query', () => {
        addSortedKey('another_id', 'audit#2019-01-01');
        const result = lessThanQuery('punch#2021-01-03');
        expect(result.length).toBe(3);
        expect(result).toEqual([
          { key: 'audit#2019-01-01', id: new Set(['another_id']) },
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
        ]);
      });

      test('Does not return the key that is equal to the query', () => {
        const result = lessThanQuery('punch#2021-01-01');
        expect(result.length).toBe(0);
        expect(result).toEqual([]);
      });

      test("returns an empty array when the key does not exist and it's before the first key", () => {
        const result = lessThanQuery('audit#2021-01-02');
        expect(result.length).toBe(0);
      });

      test('returns an empty array when the lessTan key is before the first key', () => {
        const result = lessThanQuery('punch#2020-01-31');
        expect(result.length).toBe(0);
      });
    });

    describe('lessThanEqualQuery', () => {
      test('returns all keys less than the given key including the query key', () => {
        const result = lessThanEqualQuery('punch#2021-01-15');

        expect(result.length).toBe(15);

        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
        ]);
      });

      test('returns all results if the key is greater than the last key', () => {
        const result = lessThanEqualQuery('punch#2021-12-31');

        expect(result.length).toBe(30);
        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
          { key: 'punch#2021-01-11', id: new Set(['id10']) },
          { key: 'punch#2021-01-12', id: new Set(['id11']) },
          { key: 'punch#2021-01-13', id: new Set(['id12']) },
          { key: 'punch#2021-01-14', id: new Set(['id13']) },
          { key: 'punch#2021-01-15', id: new Set(['id14']) },
          { key: 'punch#2021-01-16', id: new Set(['id15']) },
          { key: 'punch#2021-01-17', id: new Set(['id16']) },
          { key: 'punch#2021-01-18', id: new Set(['id17']) },
          { key: 'punch#2021-01-19', id: new Set(['id18']) },
          { key: 'punch#2021-01-20', id: new Set(['id19']) },
          { key: 'punch#2021-01-21', id: new Set(['id20']) },
          { key: 'punch#2021-01-22', id: new Set(['id21']) },
          { key: 'punch#2021-01-23', id: new Set(['id22']) },
          { key: 'punch#2021-01-24', id: new Set(['id23']) },
          { key: 'punch#2021-01-25', id: new Set(['id24']) },
          { key: 'punch#2021-01-26', id: new Set(['id25']) },
          { key: 'punch#2021-01-27', id: new Set(['id26']) },
          { key: 'punch#2021-01-28', id: new Set(['id27']) },
          { key: 'punch#2021-01-29', id: new Set(['id28']) },
          { key: 'punch#2021-01-30', id: new Set(['id29']) },
        ]);
      });

      test('returns a value that is less even if its first character is not the same as the query', () => {
        addSortedKey('another_id', 'audit#2019-01-01');
        const result = lessThanEqualQuery('punch#2021-01-03');
        expect(result.length).toBe(4);
        expect(result).toEqual([
          { key: 'audit#2019-01-01', id: new Set(['another_id']) },
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
          { key: 'punch#2021-01-02', id: new Set(['id1']) },
          { key: 'punch#2021-01-03', id: new Set(['id2']) },
        ]);
      });

      test('returns the key that is equal to the query', () => {
        const result = lessThanEqualQuery('punch#2021-01-01');
        expect(result.length).toBe(1);
        expect(result).toEqual([
          { key: 'punch#2021-01-01', id: new Set(['id0']) },
        ]);
      });

      test("returns an empty array when the key does not exist and it's before the first key", () => {
        const result = lessThanEqualQuery('audit#2021-01-02');
        expect(result.length).toBe(0);
      });

      test('returns an empty array when the lessTan key is before the first key', () => {
        const result = lessThanEqualQuery('punch#2020-01-31');
        expect(result.length).toBe(0);
      });
    });

    describe('betweenQuery', () => {
      test('returns all keys between the given keys, including the keys', () => {
        const result = betweenQuery('punch#2021-01-04', 'punch#2021-01-10');

        expect(result.length).toBe(7);

        expect(result).toEqual([
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
        ]);
      });

      test('returns all keys between the given keys even when the keys are out of order', () => {
        const result = betweenQuery('punch#2021-01-10', 'punch#2021-01-04');

        expect(result.length).toBe(7);

        expect(result).toEqual([
          { key: 'punch#2021-01-04', id: new Set(['id3']) },
          { key: 'punch#2021-01-05', id: new Set(['id4']) },
          { key: 'punch#2021-01-06', id: new Set(['id5']) },
          { key: 'punch#2021-01-07', id: new Set(['id6']) },
          { key: 'punch#2021-01-08', id: new Set(['id7']) },
          { key: 'punch#2021-01-09', id: new Set(['id8']) },
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
        ]);
      });

      test('returns all keys, even when they are the same', () => {
        const result = betweenQuery('punch#2021-01-10', 'punch#2021-01-10');

        expect(result.length).toBe(1);

        expect(result).toEqual([
          { key: 'punch#2021-01-10', id: new Set(['id9']) },
        ]);
      });

      test('returns an empty array if the start key is greater than the data', () => {
        const result = betweenQuery('punch#2021-03-01', 'punch#2021-03-20');
        expect(result.length).toBe(0);
      });

      test('returns an empty array if the end key is less than the data', () => {
        const result = betweenQuery('punch#2020-11-01', 'punch#2020-11-20');
        expect(result.length).toBe(0);
      });
    });
  });
});
