export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      userPoolId: 'us-east-1_tXpGrpozQ',
      tenantId: 'ec79c2bd-eeae-4891-a05e-22222a351273',
    },
  };
}

export function response(ctx) {
  // TODO define user roles and create user role mapping

  if (!Array.isArray(ctx.result)) {
    util.error('Failed to get users');
  }

  // const orgUsers = new Set(ctx.prev.result.map((mapping) => mapping.userId));
  const orgUsers = ctx.prev.result.map((mapping) => mapping.userId);

  const users = ctx.result
    // .filter((user) => orgUsers.has(user.id))
    .filter((user) => orgUsers.includes(user.id))
    .map((user) => {
      if (user.role === 'TenantAdmin') {
        return {
          ...user,
          role: 'Administrator',
        };
      }
      return user;
    });

  return users;
}
