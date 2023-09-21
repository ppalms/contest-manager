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
    console.error('Failed to get users');
  }

  const users = ctx.result.map((user) => {
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
