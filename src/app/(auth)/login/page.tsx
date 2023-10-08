/* eslint-disable @next/next/no-img-element */

'use client';

import { Transition } from '@headlessui/react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { Fragment, useContext, useState } from 'react';
import { AuthContext } from '../layout';
import LoginButton from '@/components/LoginButton';

export default function Login() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error(
      'Login is unavailiable - please contact support if this problem persists'
    );
  }

  const { setUser } = authContext;
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>();
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const handleSignIn = async (event: any) => {
    event.preventDefault();
    setSigningIn(true);
    setShowError(false);

    try {
      const user = await Auth.signIn({
        username: event.target.email.value,
        password: event.target.password.value,
      }).catch((error) => {
        setError(error.message);
        setShowError(true);
      });

      if (user?.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setUser(user);
        router.push('/new-password');
      } else if (user) {
        router.push('/');
      }
    } catch (error) {
      setError(
        'Sign in failed - please contact support if this problem persists'
      );
      setShowError(true);
      setSigningIn(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />

          <h1 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
            Contest Manager
          </h1>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="relative mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div>
            <form
              id="sign-in-form"
              className="space-y-6"
              onSubmit={(e) => handleSignIn(e)}>
              <div>
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
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  {/* <div className="text-sm">
                        <a
                          href="#"
                          className="font-semibold text-indigo-600 hover:text-indigo-500">
                          Forgot password?
                        </a>
                      </div> */}
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <LoginButton
                buttonText="Sign In"
                disabled={signingIn}
                loading={signingIn}
              />
            </form>
          </div>

          {/* <p className="mt-10 text-center text-sm text-gray-500">
                Not a member?{' '}
                <a
                  href="#"
                  className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                  Start a 14 day free trial
                </a>
              </p> */}

          <Transition
            show={showError}
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="absolute w-full rounded-md bg-red-50 p-4 mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                      onClick={() => setShowError(false)}>
                      <span className="sr-only">Dismiss</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
