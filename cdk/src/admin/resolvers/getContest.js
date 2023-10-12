import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

  return {
    operation: 'Query',
    query: {
      expression: 'PK = :pk and begins_with(SK, :sk)',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONTEST#${ctx.arguments.id}`,
      }),
    },
  };
}

export function response(ctx) {
  let contest = ctx.result.items
    .filter((entity) => entity.entityType === 'CONTEST')
    .map((contest) => {
      return {
        id: contest.SK.split('#')[1],
        name: contest.name,
        type: contest.type,
        level: contest.level,
        startDate: contest.startDate,
        endDate: contest.endDate,
        signUpStartDate: contest.signUpStartDate,
        signUpEndDate: contest.signUpEndDate,
      };
    })[0];

  const entries = ctx.result.items
    .filter((entity) => entity.entityType === 'ENTRY')
    .map((entry) => {
      return {
        id: entry.SK.split('#')[2],
        directorId: entry.directorId,
        musicSelections: entry.musicSelections,
      };
    });

  contest = { ...contest, entries: entries };

  return contest;
}
