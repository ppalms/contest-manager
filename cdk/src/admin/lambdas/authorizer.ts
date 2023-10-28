import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as jwt from 'jsonwebtoken';
import * as https from 'https';
import jwkToPem from 'jwk-to-pem';

export async function handler(
  event: any,
  _: any
): Promise<{ isAuthorized: boolean; resolverContext?: any }> {
  try {
    const decoded = jwt.decode(event.authorizationToken, { complete: true });
    const payload = decoded?.payload as jwt.JwtPayload;
    if (!payload) {
      throw new Error('Invalid JWT token');
    }

    const tenantId = payload['custom:tenantId'];
    if (!tenantId || tenantId.length === 0) {
      return {
        isAuthorized: false,
      };
    }

    const getUserPoolIdCommand = new GetParametersCommand({
      Names: ['/shared/user-pool-id'],
    });

    // TODO store tenant info in S3/cloudfront
    const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
    const ssmResult = await ssmClient.send(getUserPoolIdCommand);
    const userPoolId = ssmResult.Parameters![0].Value!;
    const jwks = await getJwks(userPoolId);
    const kid = decoded!.header.kid;
    const jwk = jwks.keys.find((key) => key.kid === kid);
    const pem = jwkToPem(jwk!);

    jwt.verify(event.authorizationToken, pem, { algorithms: ['RS256'] });

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
          ],
          Resource: `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:table/*`,
          Condition: {
            'ForAllValues:StringEquals': {
              'dynamodb:LeadingKeys': [`TENANT#${tenantId}`],
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

type JWK = {
  alg: string;
  e: string;
  kid: string;
  kty: 'RSA';
  n: string;
  use: string;
};

type JWKS = {
  keys: JWK[];
};

const getJwks = async (userPoolId: string): Promise<JWKS> => {
  const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

  return new Promise((resolve, reject) => {
    https.get(jwksUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => resolve(JSON.parse(data)));
      response.on('error', reject);
    });
  });
};
