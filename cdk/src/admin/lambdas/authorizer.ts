import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as jwt from 'jsonwebtoken';
import * as https from 'https';
import jwkToPem from 'jwk-to-pem';

interface Request {
  authorizationToken: string;
}

export async function handler(
  request: Request,
  _: any
): Promise<{ isAuthorized: boolean; resolverContext?: any }> {
  const decoded = jwt.decode(request.authorizationToken, { complete: true });
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

  // TODO store tenant context in S3/cloudfront and get rid of SSM params
  const getUserPoolIdCommand = new GetParametersCommand({
    Names: ['/shared/user-pool-id'],
  });

  const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
  const ssmResult = await ssmClient.send(getUserPoolIdCommand);
  const userPoolId = ssmResult.Parameters![0].Value!;
  try {
    await verifyJwt();

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
    console.error('Authorization failed', error);
    return {
      isAuthorized: false,
    };
  }

  // Local functions
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

  async function getJwks(): Promise<JWKS> {
    const jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

    // TODO gimme da caaccchechehchecchhe
    return new Promise((resolve, reject) => {
      https.get(jwksUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => resolve(JSON.parse(data)));
        response.on('error', reject);
      });
    });
  }

  async function verifyJwt() {
    const jwks = await getJwks();
    const kid = decoded!.header.kid;
    const jwk = jwks.keys.find((key) => key.kid === kid);
    const pem = jwkToPem(jwk!);

    jwt.verify(request.authorizationToken, pem, { algorithms: ['RS256'] });
  }
}
