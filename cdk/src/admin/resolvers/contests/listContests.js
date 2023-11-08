import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  const query = {
    expression: 'GSI1PK = :pk',
    expressionValues: util.dynamodb.toMapValues({
      ':pk': `TENANT#${tenantId}#CONTESTS`,
    }),
  };

  if (ctx.arguments.type) {
    query.expression += ' and GSI1SK = :sk';
    query.expressionValues[':sk'] = util.dynamodb.toString(ctx.arguments.type);
  }

  return {
    operation: 'Query',
    index: 'GSI1',
    query: query,
  };
}

export function response(ctx) {
  let contestItems = ctx.result.items;

  if (
    Array.isArray(ctx.arguments.classes) &&
    ctx.arguments.classes.length > 0
  ) {
    contestItems = contestItems.filter((contest) => {
      return ctx.arguments.classes.some((contestClassFilter) =>
        contest.eligibleClasses.includes(contestClassFilter)
      );
    });
  }

  const contests = contestItems.map((entity) => {
    return {
      ...entity,
      id: entity.PK.split('#')[3],
    };
  });

  return contests;
}
