/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from 'react';
import { SaveUserMutation, User } from '@/graphql/API';
import { Transition, Dialog } from '@headlessui/react';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { saveUser } from '@/graphql/resolvers/mutations';
import TextInput from './TextInput';

export interface UserListProps {
  users: User[];
  onUserSaved?: (user: User) => void;
}

export default function UserList(props: UserListProps) {
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [saving, setSaving] = useState(false);

  const { users, onUserSaved } = props;

  const validateFirstLastName = (value: string) => {
    if (!value || value.length === 0) {
      setIsValid(false);
      return 'First name is required';
    }
    if (value.length < 3) {
      setIsValid(false);
      return 'First name must be at least 3 characters long';
    }
    setIsValid(true);
    return null;
  };

  const handleSaveUser = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          saveUser,
          {
            user: {
              firstName: e.target['first-name'].value,
              lastName: e.target['last-name'].value,
              email: e.target.email.value,
              username: editUser?.username,
            },
          },
          authHeader.Authorization
        )
      )) as { data: SaveUserMutation };

      if (onUserSaved) {
        onUserSaved(result.data.saveUser as User);
      }
    } finally {
      setEditUser(null);
      setIsValid(false);
      setSaving(false);
    }
  };

  return (
    <>
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
                  {user.role}
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
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-indigo-100">
                    Edit
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  {/* <a
                    href="#"
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-indigo-100">
                    {user.enabled === true ? 'Deactivate' : 'Activate'}
                  </a> */}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/** USER EDIT MODAL **/}
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
                              Personal Information
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

                              <div className="sm:col-span-4">
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
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
