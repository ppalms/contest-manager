import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ id: ctx.arguments.id }),
  };
}

export function response(ctx) {
  const organization = ctx.result;
  ctx.stash.organization = organization;

  return {
    organization: organization,
  };
}
