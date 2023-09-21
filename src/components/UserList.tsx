/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import UserEditModal from './UserEditModal';
import { User } from '@/graphql/API';

export interface UserListProps {
  users: User[];
}

export default function UserList(props: UserListProps) {
  const [showUserEditModal, setShowUserEditModal] = useState<boolean>(false);

  console.log(props.users);
  

  return (
    <>
      <h2 className="text-sm font-medium text-gray-500">Users</h2>

      <ul
        role="list"
        className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {props.users.map((user) => (
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
                      setShowUserEditModal(true);
                    }}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-indigo-100">
                    Edit
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href="#"
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-indigo-100">
                    {user.enabled === true ? 'Deactivate' : 'Activate'}
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showUserEditModal && (
        <UserEditModal onClose={() => setShowUserEditModal(false)} />
      )}
    </>
  );
}
