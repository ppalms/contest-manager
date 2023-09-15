import * as jwt from 'jsonwebtoken';

export async function handler(
  event: any,
  _context: any
): Promise<{ isAuthorized: boolean; resolverContext?: any }> {
  try {
    const tenantId = getTenantId(event.authorizationToken);
    if (!tenantId) {
      return {
        isAuthorized: false,
      };
    }

    // TODO get tenant-scoped STS token
    /**
    const tenantPolicy = PolicyDocument.fromJson({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:DeleteItem',
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:Scan',
            'dynamodb:UpdateItem',
          ],
          Resource: `arn:aws:dynamodb:${REGION}:${event.accountId}:table/*`,
          Condition: {
            'ForAllValues:StringEquals': {
              'dynamodb:LeadingKeys': [tenantId],
            },
          },
        },
      ],
    });

    const command = new AssumeRoleCommand({
      RoleArn: `arn:aws:iam:::role/${ROLE_NAME}`,
      RoleSessionName: `ContestManagerSession-${event.requestId}`,
      Policy: JSON.stringify(tenantPolicy),
    });

    const assumeRoleResult = await stsClient.send(command);
    const credentials = assumeRoleResult.Credentials!; */

    return {
      isAuthorized: true,
      resolverContext: {
        tenantId: tenantId,
      },
    };
  } catch (error) {
    console.error('Authorization failed:', error);
    return {
      isAuthorized: false,
    };
  }
}

function getTenantId(token: string): string {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded !== 'object' || !decoded.payload) {
    throw new Error('Invalid token');
  }

  // TODO verify JWT with Cognito

  const payload = decoded.payload as jwt.JwtPayload;
  if (!payload) {
    throw new Error('Invalid token');
  }

  if (payload['custom:tenantId']) {
    return payload['custom:tenantId'];
  } else {
    throw new Error('tenantId not found in token');
  }
}
