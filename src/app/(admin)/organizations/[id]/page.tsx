'use client';

import {
  OrganizationType,
  GetOrgWithMembersQuery,
  Organization,
  SaveOrganizationMutation,
  UserReference,
  UserRole,
  SchoolClass,
} from '@/graphql/API';
import {
  saveOrganization,
  assignMembers,
  removeMember,
} from '@/graphql/resolvers/mutations';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import Notification from '@/components/Notification';
import { orgTypeMap, schoolClassMap } from '@/helpers';
import { getOrgWithMembers } from '@/graphql/resolvers/queries';
import { CheckCircleIcon, UserPlusIcon } from '@heroicons/react/20/solid';
import UserAssignment from '@/components/UserAssignment';

// TODO pull this out into a shared file and use in contests/[id] page
interface Notification {
  title: string;
  type: string;
  message: string;
  show: boolean;
}

export default function OrganizationDetail({ params }: any) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<UserReference[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState<Notification>({
    title: '',
    message: '',
    type: '',
    show: false,
  });

  const router = useRouter();

  useEffect(() => {
    const loadOrgWithUsers = async () => {
      if (params.id === 'new') {
        setOrganization({ name: '', type: OrganizationType.Unknown });
        setLoading(false);
        return;
      }

      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          getOrgWithMembers,
          { id: params.id },
          authHeader.Authorization
        )
      )) as { data: GetOrgWithMembersQuery };

      setOrganization(result.data.getOrgWithMembers?.organization ?? null);

      if (result.data.getOrgWithMembers?.members) {
        setMembers(result.data.getOrgWithMembers.members as UserReference[]);
      }
    };

    try {
      setLoading(true);
      loadOrgWithUsers()
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setNotification({
            title: 'Error loading organization', // TODO better message
            type: 'error',
            message: '',
            show: true,
          });

          setLoading(false);
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganization({ ...organization!, [name]: value });
  };

  const validateOrgName = (value: string) => {
    if (!value || value.length === 0) {
      return 'Name is required';
    }
    if (value.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    return null;
  };

  const handleAssignMembers = async (assignedMembers: UserReference[]) => {
    setLoading(true);

    try {
      const authHeader = await getAuthHeader();
      await API.graphql(
        graphqlOperation(
          assignMembers,
          {
            assignments: assignedMembers.map((user) => {
              return {
                orgId: organization!.id,
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: UserRole.Director,
              };
            }),
          },
          authHeader.Authorization
        )
      );

      const existing = members || [];
      const added = assignedMembers.filter((assigned) => {
        return !existing.some((manager) => manager.userId === assigned.userId);
      });

      setMembers([...existing, ...added]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: UserReference) => {
    if (
      !confirm(
        `Are you sure you want to remove ${member.firstName} ${member.lastName}?`
      )
    ) {
      return;
    }
    setLoading(true);

    try {
      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          removeMember,
          { ...member, orgId: organization!.id, memberId: member.userId },
          authHeader.Authorization
        )
      )) as { data: { removeMember: boolean } };

      if (result.data.removeMember === true) {
        const updated = members!.filter((m) => m.userId !== member.userId);
        setMembers(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrg = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          saveOrganization,
          { organization },
          authHeader.Authorization
        )
      )) as { data: SaveOrganizationMutation };

      setOrganization(result.data.saveOrganization!);
      setNotification({
        title: 'Successfully saved!',
        type: 'success',
        message: `${organization!.name} saved`,
        show: true,
      });
    } catch (error: any) {
      setNotification({
        title: 'Error saving',
        type: 'error',
        message: error.message,
        show: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 divide-y flex flex-col flex-grow">
        <div className="pb-10">
          <form onSubmit={(e) => handleSaveOrg(e)}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 flex">
                Organization Details
              </h1>

              {/* SAVE / CANCEL BUTTONS */}
              <div className="flex justify-end gap-x-6">
                <button
                  type="button"
                  onClick={() => router.push('/organizations')}
                  className="text-sm font-semibold leading-6 text-gray-900">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
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
                    <>
                      Save
                      <CheckCircleIcon
                        className="-mr-0.5 ml-1 h-5 w-5"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>

            <fieldset disabled={loading} aria-busy={loading}>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <TextInput
                    label="Name"
                    type="text"
                    inputName="name"
                    inputValue={organization?.name || ''}
                    onChange={handleInputChange}
                    validate={validateOrgName}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-neutral-600 sm:text-sm sm:leading-6 disabled:ring-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300"
                    value={organization?.type || OrganizationType.Unknown}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const type = e.target.value as OrganizationType;
                      setOrganization({ ...organization!, type });
                    }}>
                    <option value={OrganizationType.Unknown}>
                      {loading ? '' : 'Select a type'}
                    </option>
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

                {organization?.type === OrganizationType.School && (
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="class"
                      className="block text-sm font-medium leading-6 text-gray-900">
                      Class
                    </label>
                    <select
                      id="class"
                      name="class"
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-neutral-600 sm:text-sm sm:leading-6 disabled:ring-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300"
                      value={organization?.class || SchoolClass.Unknown}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const schoolClass = e.target.value as SchoolClass;
                        setOrganization({
                          ...organization!,
                          class: schoolClass,
                        });
                      }}>
                      <option value={SchoolClass.Unknown}>
                        {loading ? '' : 'Select a class'}
                      </option>
                      <option value={SchoolClass['1A']}>
                        {schoolClassMap[SchoolClass['1A']]}
                      </option>
                      <option value={SchoolClass['2A']}>
                        {schoolClassMap[SchoolClass['2A']]}
                      </option>
                      <option value={SchoolClass['3A']}>
                        {schoolClassMap[SchoolClass['3A']]}
                      </option>
                      <option value={SchoolClass['4A']}>
                        {schoolClassMap[SchoolClass['4A']]}
                      </option>
                      <option value={SchoolClass['5A']}>
                        {schoolClassMap[SchoolClass['5A']]}
                      </option>
                      <option value={SchoolClass['6A']}>
                        {schoolClassMap[SchoolClass['6A']]}
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </fieldset>
          </form>
        </div>

        {/* MEMBERS */}
        <div className="flex-grow pt-8">
          {!loading && organization?.id ? (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold leading-7 text-gray-900 flex">
                  Members
                </h1>

                <div className="flex justify-end gap-x-6">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                    onClick={() => {
                      setShowAssignmentModal(true);
                    }}>
                    Assign Manager
                    <UserPlusIcon
                      className="-mr-0.5 ml-1 h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <ul role="list" className="divide-y pt-2 divide-neutral-200">
                {members?.map((member) => (
                  <li
                    key={member.userId}
                    className="flex items-center justify-between gap-x-6 py-2">
                    <div className="min-w-0">
                      <div className="flex items-start gap-x-3">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-blue-500 hover:text-blue-700">
                        <p className="whitespace-nowrap">
                          <a href={`mailto:${member.email}`} target="_blank">
                            {member.email}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-x-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">
                        Remove
                        <span className="sr-only">
                          , {member.firstName} {member.lastName}
                        </span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <></>
          )}

          {loading && (
            <div className="flex justify-center h-full pt-32">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-rose-700" />
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN MEMBER MODAL */}
      {organization?.id && (
        <UserAssignment
          title="Select Directors"
          role={UserRole.Director}
          show={showAssignmentModal}
          setShow={setShowAssignmentModal}
          onAssign={handleAssignMembers}
        />
      )}

      {notification.show && (
        <Notification
          title={notification.title}
          message={notification.message || ''}
          show={notification.show}
          notificationType={notification.type}
          returnHref="/organizations"
          returnDescription="organization list"
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </>
  );
}
