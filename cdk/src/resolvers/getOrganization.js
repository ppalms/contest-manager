import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ id: ctx.arguments.id }),
  };
}

export function response(ctx) {
  return {
    organization: ctx.result,
  };
}
