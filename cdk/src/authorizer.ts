import * as jwt from 'jsonwebtoken';

export async function handler(event: any, _context: any): Promise<any> {
  try {
    const tenantId = getTenantId(event.authorizationToken);
    if (!tenantId)
      return {
        isAuthorized: false,
      };

    return {
      isAuthorized: true,
      resolverContext: {
        tenantId: tenantId,
      },
    };
  } catch (error) {
    console.error('Authorization failed:', error);
    throw new Error('Unauthorized');
  }
}

function getTenantId(token: string): string | null {
  try {
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
  } catch (error) {
    console.error('Failed to validate and extract tenantId', error);
    return null;
  }
}
