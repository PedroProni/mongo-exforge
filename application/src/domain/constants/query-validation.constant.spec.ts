import { COLLECTION_NAME_PATTERN, FIELD_PATH_PATTERN } from '@domain/constants/query-validation.constant';

describe('query validation patterns', () => {
  it.each(['people', 'order_items', 'a.b', 'A-1', '_x'])('accepts the collection %j', name => {
    expect(COLLECTION_NAME_PATTERN.test(name)).toBe(true);
  });

  it.each(['system.users', 'system.profile', '$out', 'a$b', 'a b', '', '../x', 'a'.repeat(101), '.hidden'])('rejects the collection %j', name => {
    expect(COLLECTION_NAME_PATTERN.test(name)).toBe(false);
  });

  it.each(['name', 'address.city', 'a-b.c_d'])('accepts the field %j', name => {
    expect(FIELD_PATH_PATTERN.test(name)).toBe(true);
  });

  it.each(['$where', '$expr', 'a..b', 'a.$b', '', '.a', 'a.'])('rejects the field %j', name => {
    expect(FIELD_PATH_PATTERN.test(name)).toBe(false);
  });
});
