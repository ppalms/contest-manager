/* eslint-disable @next/next/no-img-element */

const users = [
  {
    id: 'test1',
    name: 'Herp Derpington',
    email: 'foo@bar.org',
    initials: 'GA',
    href: '#',
    role: 'Director',
    bgColor: 'bg-pink-600',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    state: 'Active',
  },
  {
    id: 'test2',
    name: 'Component Design',
    email: 'foo@bar.org',
    initials: 'CD',
    href: '#',
    role: 'Director',
    bgColor: 'bg-purple-600',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    state: 'Active',
  },
  {
    id: 'test3',
    name: 'Templates',
    email: 'foo@bar.org',
    initials: 'T',
    href: '#',
    role: 'Contest Manager',
    bgColor: 'bg-yellow-500',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    state: 'Active',
  },
  {
    id: 'test4',
    name: 'React Components',
    email: 'foo@bar.org',
    initials: 'RC',
    href: '#',
    role: 'Director',
    bgColor: 'bg-green-500',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
    state: 'Disabled',
  },
];

export default function Users() {
  return (
    <>
      <h2 className="text-sm font-medium text-gray-500">Users</h2>

      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <li
            key={user.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </h3>
                  <span className="inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-600/20">
                    {user.state}
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
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                    Edit
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href="#"
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                    {user.state === 'Active' ? 'Deactivate' : 'Activate'}
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
