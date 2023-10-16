/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from 'react';
import { SaveUserMutation, User, UserRole } from '@/graphql/API';
import { Transition, Dialog } from '@headlessui/react';
import { getAuthHeader, userRoleMap } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { saveUser } from '@/graphql/resolvers/mutations';
import { UserPlusIcon } from '@heroicons/react/20/solid';
import TextInput from './TextInput';

export interface UserListProps {
  users: User[];
  organizationId: string;
  onUserSaved?: (user: User) => void;
}

export default function UserList(props: UserListProps) {
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isValidUser, setIsValidUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRoleError, setUserRoleError] = useState<string | null>(null);

  const { users, onUserSaved } = props;

  const validateFirstLastName = (value: string) => {
    if (!value || value.length === 0) {
      setIsValidUser(false);
      return 'Name is required';
    }
    setIsValidUser(true);
    return null;
  };

  // TODO validate email

  const validateUserRole: (role: UserRole) => boolean = (role: UserRole) => {
    if (role === UserRole.Unknown) {
      setIsValidUser(false);
      setUserRoleError('User role is required');
      return false;
    } else {
      setIsValidUser(true);
      setUserRoleError(null);
      return true;
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    validateUserRole(role);
    setEditUser({ ...editUser!, role });
  };

  // TODO fix event type
  const handleSaveUser = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    if (!editUser) {
      throw new Error('No user to save');
    }

    const hasValidRole = validateUserRole(editUser.role);
    if (!hasValidRole) {
      setSaving(false);
      return;
    }

    try {
      const authHeader = await getAuthHeader();
      const username =
        editUser!.username.length === 0
          ? e.target.email.value
          : editUser!.username;

      const result = (await API.graphql(
        graphqlOperation(
          saveUser,
          {
            user: {
              id: editUser!.id,
              username: username,
              firstName: e.target['first-name'].value,
              lastName: e.target['last-name'].value,
              email: e.target.email.value,
              role: e.target['user-role'].value,
              organizationId: props.organizationId,
            },
          },
          authHeader.Authorization
        )
      )) as { data: SaveUserMutation };

      let savedUser: User;
      const i = users.findIndex((u) => u.id === result.data.saveUser!.id);
      if (i === -1) {
        savedUser = result.data.saveUser!;
        users.push(savedUser);
      } else {
        savedUser = {
          ...users[i],
          ...result.data.saveUser,
        };
        users[i] = savedUser;
      }

      if (onUserSaved) {
        onUserSaved(savedUser);
      }
      setEditUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsValidUser(false);
      setSaving(false);
    }
  };

  return (
    <>
      <div className="sm:flex flex-row-reverse">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          onClick={() => {
            setEditUser({
              id: '',
              firstName: '',
              lastName: '',
              email: '',
              username: '',
              enabled: true,
              role: UserRole.Unknown,
            });
          }}>
          Add
          <UserPlusIcon className="-mr-0.5 ml-1 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* USER LIST */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      user.enabled === true
                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                        : 'bg-gray-100 text-gray-700 ring-gray-600/20'
                    }`}>
                    {user.enabled === true ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {userRoleMap[user.role]}
                </p>
              </div>
            </div>

            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  <a
                    href="#"
                    type="button"
                    onClick={() => {
                      setEditUser(user);
                    }}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-rose-100">
                    Edit
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  {/* <a
                    href="#"
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-rose-100">
                    {user.enabled === true ? 'Deactivate' : 'Activate'}
                  </a> */}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* USER EDIT MODAL */}
      <Transition.Root show={editUser !== null} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setEditUser(null);
          }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto lg:left-36">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:mx-4 sm:p-6">
                  <div>
                    <form onSubmit={(e) => handleSaveUser(e)}>
                      <fieldset>
                        <div className="space-y-12">
                          <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">
                              User Information
                            </h2>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                <TextInput
                                  label="First name"
                                  inputName="first-name"
                                  inputValue={editUser?.firstName ?? ''}
                                  type="text"
                                  validate={validateFirstLastName}
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <TextInput
                                  label="Last name"
                                  inputName="last-name"
                                  inputValue={editUser?.lastName ?? ''}
                                  type="text"
                                  validate={validateFirstLastName}
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label
                                  htmlFor="user-role"
                                  className="block text-sm font-medium leading-6 text-gray-900">
                                  Role
                                </label>
                                <select
                                  id="user-role"
                                  name="user-role"
                                  className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-rose-600 sm:text-sm sm:leading-6 ${
                                    userRoleError
                                      ? 'ring-red-300 text-red-900 focus:ring-red-500'
                                      : ''
                                  }`}
                                  value={editUser?.role || UserRole.Unknown}
                                  onChange={handleRoleChange}>
                                  <option value={UserRole.Unknown}>
                                    Select a role
                                  </option>
                                  <option value={UserRole.ContestManager}>
                                    {userRoleMap[UserRole.ContestManager]}
                                  </option>
                                  <option value={UserRole.Director}>
                                    {userRoleMap[UserRole.Director]}
                                  </option>
                                </select>

                                {userRoleError ? (
                                  <p
                                    className="mt-2 text-sm text-red-600"
                                    id="input-error">
                                    {userRoleError}
                                  </p>
                                ) : null}
                              </div>

                              <div className="sm:col-span-6">
                                <label
                                  htmlFor="email"
                                  className="block text-sm font-medium leading-6 text-gray-900">
                                  Email address
                                </label>
                                <div className="mt-2">
                                  <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
                                    defaultValue={editUser?.email}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                          <button
                            type="button"
                            onClick={() => {
                              setEditUser(null);
                            }}
                            className="text-sm font-semibold leading-6 text-gray-900">
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!isValidUser || saving}
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
                              'Save'
                            )}
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
