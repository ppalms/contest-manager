import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

  return {
    operation: 'Query',
    query: {
      expression: 'PK = :pk',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}#CONTEST#${ctx.arguments.id}`,
      }),
    },
  };
}

export function response(ctx) {
  let contest = null;
  const managers = [];

  for (const item of ctx.result.items) {
    if (item.entityType === 'CONTEST') {
      contest = { ...item, id: item.PK.split('#')[3] };
    } else if (item.entityType === 'MANAGER') {
      managers.push({ ...item, id: item.SK.split('#')[1] });
    }
  }

  return { ...contest, managers: managers };
}
