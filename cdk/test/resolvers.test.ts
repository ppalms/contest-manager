const getOrgUserMappings = require('../src/resolvers/getOrgUserMappings');

test('Missing organization ID fails', () => {
  const badRequest = {
    arguments: {},
    source: {},
    stash: {},
    result: {},
  };

  const result = getOrgUserMappings.request(badRequest);
  expect(result).toBe({
    error: 'Missing ctx.stash.organization',
  });
});
