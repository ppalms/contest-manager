import { Auth } from 'aws-amplify';

export const getAuthHeader = async () => {
  const session = await Auth.currentSession();
  const idToken = session.getIdToken().getJwtToken();
  return {
    Authorization: idToken,
  };
};
