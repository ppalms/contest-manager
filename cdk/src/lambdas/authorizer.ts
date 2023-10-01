import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as jwt from 'jsonwebtoken';

export async function handler(
  event: any,
  _context: any
): Promise<{ isAuthorized: boolean; resolverContext?: any }> {
  try {
    const decoded = jwt.decode(event.authorizationToken, { complete: true });
    const payload = decoded?.payload as jwt.JwtPayload;
    if (!payload) {
      throw new Error('Invalid JWT token');
    }

    // TODO verify JWT with Cognito

    const tenantId = payload['custom:tenantId'];
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

    // TODO get from tenant details in dynamodb
    const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

    const ssmResult = await ssmClient.send(
      new GetParametersCommand({
        Names: ['/shared/user-pool-id'],
      })
    );
    const userPoolId = ssmResult.Parameters![0].Value!;

    return {
      isAuthorized: true,
      resolverContext: {
        tenantId: tenantId,
        userPoolId: userPoolId,
      },
    };
  } catch (error) {
    console.error('Authorization failed:', error);
    return {
      isAuthorized: false,
    };
  }
}
