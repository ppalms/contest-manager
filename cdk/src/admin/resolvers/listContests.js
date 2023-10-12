export function request(ctx) {
  // TODO get from SSM
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

  return {
    operation: 'Query',
    query: {
      expression: 'PK = :pk and begins_with(SK, :sk)',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}`,
        ':sk': `CONTEST#`,
      }),
    },
  };
}

export function response(ctx) {
  const contests = ctx.result.items
    ?.filter((entity) => entity.entityType === 'CONTEST')
    .map((entity) => {
      return {
        id: entity.SK.split('#')[1],
        name: entity.name,
        startDate: entity.startDate,
        endDate: entity.endDate,
        signUpStartDate: entity.signUpStartDate,
        signUpEndDate: entity.signUpEndDate,
        type: entity.type,
        level: entity.level,
        directorId: entity.directorId,
        musicSelections: entity.musicSelections,
      };
    });

  return contests;
}
