/* eslint-disable @next/next/no-img-element */

'use client';

import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { Fragment, useContext, useState } from 'react';
import { AuthContext } from '../layout';
import {
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { Transition } from '@headlessui/react';
import LoginButton from '@/components/LoginButton';

export default function NewPassword() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error(
      'Login is unavailiable - please contact support if this problem persists'
    );
  }

  const { user } = authContext;
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>();
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const handleNewPassword = async (event: any) => {
    event.preventDefault();
    setSigningIn(true);
    setShowError(false);

    if (!user) {
      console.error('User not found - redirecting to login');
      router.push('/login');
    }

    let errorMessage;
    try {
      await Auth.completeNewPassword(
        user,
        event.target['new-password'].value
      ).catch((error) => {
        errorMessage = error.message;
        setError(errorMessage);
        setShowError(true);
        setSigningIn(false);
        if (errorMessage.indexOf('Invalid session') !== -1) {
          router.push('/login');
        }
      });

      if (!errorMessage) {
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

  const validatePassword = (password: string): void => {
    if (password.length < 10) {
      setIsValidPassword(false);
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setIsValidPassword(
      hasUppercase && hasLowercase && hasNumber && hasSpecialChar
    );
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=rose&shade=600"
            alt="Your Company"
          />
          <h1 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-gray-900">
            Welcome
          </h1>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create a password to continue
          </h2>
        </div>

        <div className="relative mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div>
            <form
              id="new-password-form"
              className="space-y-6"
              onSubmit={(e) => handleNewPassword(e)}>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium leading-6 text-gray-900">
                  New Password
                </label>
                <div className="mt-2">
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-rose-600 sm:text-sm sm:leading-6"
                    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      validatePassword(e.currentTarget.value)
                    }
                  />
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      <h3 className="font-medium text-blue-800">
                        Requirements
                      </h3>
                      <ul className="list-disc mt-2">
                        <li>10 characters minimum</li>
                        <li>Contains at least 1 number</li>
                        <li>Contains at least 1 uppercase letter</li>
                        <li>Contains at least 1 special character</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              <LoginButton
                buttonText="Continue"
                disabled={signingIn || !isValidPassword}
                loading={signingIn}
              />
            </form>
          </div>

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
