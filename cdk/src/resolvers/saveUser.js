export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      userPoolId: 'us-east-1_tXpGrpozQ',
      user: ctx.arguments.user,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
