export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      userPoolId: ctx.stash.userPoolId,
      tenantId: ctx.stash.tenantId,
    },
  };
}

export function response(ctx) {
  if (!Array.isArray(ctx.result)) {
    util.error('Failed to get users');
  }

  // TODO Set is supposed to be faster than Array.includes() but Appsync doesn't like it
  // const orgUsers = new Set(ctx.prev.result.map((mapping) => mapping.userId));
  const orgUsers = ctx.prev.result.map((mapping) => mapping.userId);

  const users = ctx.result
    // .filter((user) => orgUsers.has(user.id))
    .filter((user) => orgUsers.includes(user.id));

  return users;
}
