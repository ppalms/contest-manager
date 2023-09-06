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
