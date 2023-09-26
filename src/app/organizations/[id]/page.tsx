'use client';

import {
  UpdateOrganizationMutation,
  OrganizationType,
  CreateOrganizationMutation,
  GetOrganizationWithUsersQuery,
  User,
  Organization,
} from '@/graphql/API';
import {
  createOrganization,
  updateOrganization,
} from '@/graphql/resolvers/mutations';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import TextInput from '@/components/TextInput';
import Notification from '@/components/Notification';
import { orgTypeMap } from '@/org-type-map';
import UserList from '@/components/UserList';
import { getOrganizationWithUsers } from '@/graphql/resolvers/queries';

export default function OrganizationDetail({ params }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const router = useRouter();

  const validateOrgName = (value: string) => {
    if (!value || value.length === 0) {
      setIsValid(false);
      return 'Name is required';
    }
    if (value.length < 3) {
      setIsValid(false);
      return 'Name must be at least 3 characters long';
    }
    setIsValid(true);
    return null;
  };

  useEffect(() => {
    const fetchOrgWithUsers = async () => {
      if (params.id === 'new') {
        setIsValid(false);
        return;
      }

      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          getOrganizationWithUsers,
          { id: params.id },
          authHeader.Authorization
        )
      )) as { data: GetOrganizationWithUsersQuery };

      setOrganization(
        result.data.getOrganizationWithUsers?.organization ?? null
      );

      if (result.data.getOrganizationWithUsers?.users) {
        setUsers(result.data.getOrganizationWithUsers.users as User[]);
      }
    };

    try {
      setLoading(true);
      fetchOrgWithUsers().then(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [params.id]);

  // TODO figure out event type
  const handleSaveOrg = async (event: any) => {
    event.preventDefault();
    try {
      setSaving(true);
      const authHeader = await getAuthHeader();
      if (organization?.id) {
        const result = (await API.graphql(
          graphqlOperation(
            updateOrganization,
            {
              organization: {
                id: organization.id,
                name: event.target.name.value,
                type: event.target.type.value as OrganizationType,
              },
            },
            authHeader.Authorization
          )
        )) as { data: UpdateOrganizationMutation };

        setOrganization(result.data.updateOrganization!);
      } else {
        const result = (await API.graphql(
          graphqlOperation(
            createOrganization,
            {
              organization: {
                id: v4(),
                name: event.target.name.value,
                type: event.target.type.value as OrganizationType,
              },
            },
            authHeader.Authorization
          )
        )) as { data: CreateOrganizationMutation };

        setOrganization(result.data.createOrganization!);
      }
      setNotificationTitle('Successfully saved!');
      setNotificationMessage(`${event.target.name.value} saved`);
      setNotificationType('success');
    } catch (error: any) {
      setNotificationTitle('Error saving');
      setNotificationMessage(error.message);
      setNotificationType('error');
    } finally {
      setSaving(false);
      setShowNotification(true);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Organization Details
        </h3>
      </div>

      <form onSubmit={(e) => handleSaveOrg(e)}>
        <fieldset disabled={loading} aria-busy={loading}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <TextInput
                label="Name"
                type="text"
                inputName="name"
                inputValue={organization?.name || ''}
                validate={validateOrgName}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={organization?.type || OrganizationType.School}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const type = e.target.value as OrganizationType;
                  setOrganization({ ...organization!, type });
                }}>
                <option value={OrganizationType.State}>
                  {orgTypeMap[OrganizationType.State]}
                </option>
                <option value={OrganizationType.District}>
                  {orgTypeMap[OrganizationType.District]}
                </option>
                <option value={OrganizationType.School}>
                  {orgTypeMap[OrganizationType.School]}
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={() => router.push('/organizations')}
              className="text-sm font-semibold leading-6 text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {saving ? (
                <>
                  Saving
                  <svg
                    className="animate-spin -mr-0.5 ml-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </fieldset>
      </form>

      {organization?.id && (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Users
            </h3>
          </div>
        </div>
      )}

      <UserList
        users={users}
        onUserSaved={(user) => {
          if (!users?.length || users.length === 0) {
            return;
          }

          const i = users.findIndex((u) => u?.id === user.id);
          if (i === -1) {
            users.push(user);
          } else {
            users[i] = { ...users[i], ...user };
          }

          setNotificationTitle('Successfully saved!');
          setNotificationMessage(`${user.firstName} ${user.lastName} saved`);
          setNotificationType('success');
          setShowNotification(true);
        }}
      />

      {showNotification && (
        <Notification
          title={notificationTitle}
          message={notificationMessage}
          show={showNotification}
          notificationType={notificationType}
          returnHref="/organizations"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}
