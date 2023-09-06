import { Auth } from 'aws-amplify';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getAuthHeader = async () => {
  const session = await Auth.currentSession();
  const idToken = session.getIdToken().getJwtToken();
  return {
    Authorization: idToken,
  };
};
