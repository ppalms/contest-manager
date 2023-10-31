import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { API, graphqlOperation } from 'aws-amplify';
import { ListUsersByRoleQuery, UserReference, UserRole } from '@/graphql/API';
import { listUsersByRole } from '@/graphql/resolvers/queries';
import { classNames, getAuthHeader } from '@/helpers';
import { assignManagers } from '@/graphql/resolvers/mutations';

interface UserAssignmentProps {
  parentId: string;
  title: string;
  role: UserRole;
  show: boolean;
  setShow: (show: boolean) => void;
  onAssign: (assignedUsers: UserReference[]) => void;
}

async function fetchUsers(role: UserRole): Promise<UserReference[]> {
  const authHeader = await getAuthHeader();
  const userList = (await API.graphql(
    graphqlOperation(listUsersByRole, { role }, authHeader.Authorization)
  )) as { data: ListUsersByRoleQuery };

  return userList.data.listUsersByRole.map((user) => {
    return {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  });
}

// TODO use this method for getting props in other components
const UserAssignment: React.FC<UserAssignmentProps> = ({
  parentId,
  title,
  role,
  show,
  setShow,
  onAssign,
}) => {
  const [userList, setUserList] = useState<UserReference[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserReference[]>([]);

  const checkbox = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    fetchUsers(role).then((userList) => {
      // TODO filter existing users
      setUserList(userList);
    });
  }, [role]);

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedUsers &&
      selectedUsers.length > 0 &&
      selectedUsers.length < userList.length;
    setChecked(selectedUsers.length === userList.length);
    setIndeterminate(isIndeterminate);

    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedUsers, userList]);

  function toggleAll() {
    setSelectedUsers(checked || indeterminate ? [] : userList);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  async function handleAssignUsers(user?: UserReference) {
    if (!user && selectedUsers.length === 0) {
      return;
    }

    // Prompt the user if they clicked an "Assign" link on an individual
    let message: string;
    if (user) {
      message = `Assign ${user.firstName} ${user.lastName}`;
      if (
        selectedUsers.length === 0 ||
        (selectedUsers.length === 1 && selectedUsers[0].userId === user.userId)
      ) {
        message += '?';
      } else {
        message += ` and ${
          selectedUsers.filter((u) => u.userId !== user.userId).length
        } other user(s)?`;
      }

      if (!confirm(message)) {
        return;
      }
    }

    let assignedUsers = selectedUsers;
    if (user) {
      assignedUsers.push(user);
    }

    // TODO move to parent component
    const authHeader = await getAuthHeader();
    await API.graphql(
      graphqlOperation(
        assignManagers,
        {
          assignments: assignedUsers.map((user) => {
            return {
              contestId: parentId,
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            };
          }),
        },
        authHeader.Authorization
      )
    );
    onAssign(assignedUsers);
    closeAndReset();
  }

  function closeAndReset() {
    setShow(false);
    setSelectedUsers([]);
    setIndeterminate(false);
  }

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeAndReset}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-neutral-500 bg-opacity-70 transition-opacity" />
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
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="bg-gray-100 px-4 py-4 sm:px-6">
                    <h3 className="text-md font-bold">{title || 'Users'}</h3>
                  </div>
                  <div className="py-2 px-4 sm:px-6">
                    <div className="flow-root">
                      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 pb-4 align-middle sm:px-6 lg:px-8">
                          <div className="relative">
                            {selectedUsers.length > 0 && (
                              <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                                <button
                                  type="button"
                                  onClick={() => handleAssignUsers()}
                                  className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">
                                  Assign Selected
                                </button>
                              </div>
                            )}
                            <table className="min-w-full table-fixed divide-y divide-gray-300">
                              <thead>
                                <tr>
                                  <th
                                    scope="col"
                                    className="relative px-7 sm:w-12 sm:px-6">
                                    <input
                                      type="checkbox"
                                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-neutral-600"
                                      ref={checkbox}
                                      checked={checked}
                                      onChange={toggleAll}
                                    />
                                  </th>
                                  <th
                                    scope="col"
                                    className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                                    Name
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Email
                                  </th>
                                  <th
                                    scope="col"
                                    className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                                    <span className="sr-only">Assign</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {userList.map((user: UserReference) => (
                                  <tr
                                    key={user.email}
                                    className={
                                      selectedUsers.includes(user)
                                        ? 'bg-gray-50'
                                        : undefined
                                    }>
                                    <td className="relative px-7 sm:w-12 sm:px-6">
                                      {selectedUsers.includes(user) && (
                                        <div className="absolute inset-y-0 left-0 w-0.5 bg-rose-600" />
                                      )}
                                      <input
                                        type="checkbox"
                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-neutral-600"
                                        value={user.userId}
                                        checked={selectedUsers.includes(user)}
                                        onChange={(e) =>
                                          setSelectedUsers(
                                            e.target.checked
                                              ? [...selectedUsers, user]
                                              : selectedUsers.filter(
                                                  (u) => u !== user
                                                )
                                          )
                                        }
                                      />
                                    </td>
                                    <td
                                      className={classNames(
                                        'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                                        selectedUsers.includes(user)
                                          ? 'text-rose-600'
                                          : 'text-gray-900'
                                      )}>
                                      {user.firstName} {user.lastName}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {user.email}
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                      <a
                                        type="button"
                                        onClick={() => {
                                          handleAssignUsers(user);
                                        }}
                                        className="text-rose-600 hover:text-rose-900 hover:cursor-pointer">
                                        Assign
                                        <span className="sr-only">
                                          , {user.firstName} {user.lastName}
                                        </span>
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pr-4">
                  <button
                    type="button"
                    onClick={closeAndReset}
                    className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-300 hover:outline hover:outline-1 hover:outline-neutral-300 hover:outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600">
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default UserAssignment;
