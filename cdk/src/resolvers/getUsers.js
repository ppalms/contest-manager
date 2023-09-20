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
  return ctx.result;
}
