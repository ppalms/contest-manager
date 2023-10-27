import React, { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { classNames } from '@/helpers';
import { Manager } from '@/graphql/API';

interface UserSearchProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

// TODO query GSI1 on GSI1PK TENANT#<TenantId>#USERS and GSI1SK 'MANAGER'
const people = [
  { id: '1', firstName: 'Leslie', lastName: 'Alexander', email: 'a@b.c' },
  { id: '2', firstName: 'Turd', lastName: 'Ferguson', email: 'd@e.f' },
  { id: '3', firstName: 'Beep', lastName: 'Boop', email: 'g@h.i' },
  { id: '4', firstName: 'Fat', lastName: 'Wa', email: 'j@k.l' },
];

const UserSearch: React.FC<UserSearchProps> = ({ show, setShow }) => {
  const checkbox = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Manager[]>([]);

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedPeople.length > 0 && selectedPeople.length < people.length;
    setChecked(selectedPeople.length === people.length);
    setIndeterminate(isIndeterminate);

    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedPeople]);

  function toggleAll() {
    setSelectedPeople(checked || indeterminate ? [] : people);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function onClose() {
    setShow(false);
    setSelectedPeople([]);
    setIndeterminate(false);
  }

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                    <h3 className="text-md font-bold">Assign Managers</h3>
                  </div>
                  <div className="py-2 px-4 sm:px-6">
                    <div className="flow-root">
                      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 pb-4 align-middle sm:px-6 lg:px-8">
                          <div className="relative">
                            {selectedPeople.length > 0 && (
                              <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                                <button
                                  type="button"
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
                                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
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
                                {people.map((person) => (
                                  <tr
                                    key={person.email}
                                    className={
                                      selectedPeople.includes(person)
                                        ? 'bg-gray-50'
                                        : undefined
                                    }>
                                    <td className="relative px-7 sm:w-12 sm:px-6">
                                      {selectedPeople.includes(person) && (
                                        <div className="absolute inset-y-0 left-0 w-0.5 bg-rose-600" />
                                      )}
                                      <input
                                        type="checkbox"
                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                                        value={person.email}
                                        checked={selectedPeople.includes(
                                          person
                                        )}
                                        onChange={(e) =>
                                          setSelectedPeople(
                                            e.target.checked
                                              ? [...selectedPeople, person]
                                              : selectedPeople.filter(
                                                  (p) => p !== person
                                                )
                                          )
                                        }
                                      />
                                    </td>
                                    <td
                                      className={classNames(
                                        'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                                        selectedPeople.includes(person)
                                          ? 'text-rose-600'
                                          : 'text-gray-900'
                                      )}>
                                      {person.firstName} {person.lastName}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {person.email}
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                      <a
                                        href="#"
                                        className="text-rose-600 hover:text-rose-900">
                                        Assign
                                        <span className="sr-only">
                                          , {person.firstName} {person.lastName}
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
                    onClick={onClose}
                    className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-300 hover:outline hover:outline-1 hover:outline-neutral-300 hover:outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600">
                    Close
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

export default UserSearch;
