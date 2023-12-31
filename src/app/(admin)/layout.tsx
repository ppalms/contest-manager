// These styles apply to every route in the application

'use client';

import { Amplify, Auth } from 'aws-amplify';
import { classNames } from '@/helpers';
import { Transition, Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  Cog6ToothIcon,
  Bars3Icon,
  HomeIcon,
  TrophyIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import AmplifyConfig from '@/amplify-config';
import AppLogo from '@/components/AppLogo';

Amplify.configure(AmplifyConfig); // TODO use AuthContext and get rid of Amplify.configure

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, current: true },
  { name: 'Contests', href: '/contests', icon: TrophyIcon, current: false },
  {
    name: 'Organizations',
    href: '/organizations',
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserCircleIcon,
    current: false,
  },
];

// TODO this might not be useful
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
];

const NavLayout = ({ children }: { children: React.ReactNode }) => {
  // TODO move auth/user state handling into AuthContext and pull user from there
  interface CognitoUser {
    username: string;
    attributes: {
      family_name: string;
      given_name: string;
      email: string;
    };
  }
  const [user, setUser] = useState<CognitoUser | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        if (currentUser && !user) {
          setUser(currentUser);
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuthStatus();
  }, [router, user]);

  navigation.map((link) => {
    link.current = pathName === link.href;
  });

  if (!user) {
    return <></>;
  }

  return (
    <>
      <div className="bg-neutral-100">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <div className="fixed inset-0 bg-neutral-500 bg-opacity-70" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full">
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-neutral-600 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <AppLogo />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    item.current
                                      ? 'bg-neutral-700 text-white'
                                      : 'text-neutral-200 hover:text-white hover:bg-neutral-700',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}>
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? 'text-white'
                                        : 'text-neutral-200 group-hover:text-white',
                                      'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li hidden={true}>
                          <div className="text-xs font-semibold leading-6 text-neutral-200">
                            Your teams
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? 'bg-neutral-700 text-white'
                                      : 'text-neutral-200 hover:text-white hover:bg-neutral-700',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}>
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-neutral-400 bg-neutral-500 text-[0.625rem] font-medium text-white">
                                    {team.initial}
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto" hidden={true}>
                          <a
                            href="#"
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-neutral-200 hover:bg-neutral-700 hover:text-white">
                            <Cog6ToothIcon
                              className="h-6 w-6 shrink-0 text-neutral-200 group-hover:text-white"
                              aria-hidden="true"
                            />
                            Settings
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-neutral-600 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <AppLogo />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-neutral-700 text-white'
                              : 'text-neutral-200 hover:text-white hover:bg-neutral-700',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}>
                          <item.icon
                            className={classNames(
                              item.current
                                ? 'text-white'
                                : 'text-neutral-200 group-hover:text-white',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li hidden={true}>
                  <div className="text-xs font-semibold leading-6 text-neutral-200">
                    Your teams
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? 'bg-neutral-700 text-white'
                              : 'text-neutral-200 hover:text-white hover:bg-neutral-700',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-neutral-400 bg-neutral-500 text-[0.625rem] font-medium text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto" hidden={true}>
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-neutral-200 hover:bg-neutral-700 hover:text-white">
                    <Cog6ToothIcon
                      className="h-6 w-6 shrink-0 text-neutral-200 group-hover:text-white"
                      aria-hidden="true"
                    />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72 h-screen flex flex-col">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-neutral-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-neutral-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* TODO search bar */}
              <div className="relative flex flex-1"></div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* TODO <button
                  type="button"
                  className="-m-2.5 p-2.5 text-neutral-400 hover:text-neutral-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button> */}

                {/* Separator */}
                {/* <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-900/10"
                  aria-hidden="true"
                /> */}

                {/* Profile dropdown */}
                <ProfileDropdown user={user} />
              </div>
            </div>
          </div>

          <main className="p-10 flex flex-col flex-grow">{children}</main>
        </div>
      </div>
    </>
  );
};

export default NavLayout;
