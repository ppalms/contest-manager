export function request(ctx) {
  // TODO replace hard-coded identity context values
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';
  const userPoolId =
    ctx.identity?.resolverContext.userPoolId ?? 'us-east-1_tXpGrpozQ';

  return {
    operation: 'PutEvents',
    events: [
      {
        source: 'contest-manager.admin.users',
        detail: { tenantId, userPoolId, user: ctx.arguments.user },
        detailType: ctx.arguments.user.id ? 'User Updated' : 'User Created',
      },
    ],
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type, ctx.result);
  }
  return ctx.prev.result;
}
