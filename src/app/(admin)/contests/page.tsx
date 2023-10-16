'use client';

import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listContests } from '@/graphql/resolvers/queries';
import { Contest } from '@/graphql/API';
import { contestTypeMap, getAuthHeader } from '@/helpers';
import { FolderPlusIcon } from '@heroicons/react/20/solid';
import { deleteContest } from '@/graphql/resolvers/mutations';

const Page = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      const authHeader = await getAuthHeader();
      const result: GraphQLResult<any> = await API.graphql(
        graphqlOperation(listContests),
        authHeader
      );
      setContests(result.data.listContests);
    };
    fetchContests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) {
      return;
    }

    const authHeader = await getAuthHeader();
    await API.graphql(graphqlOperation(deleteContest, { id }), authHeader);

    setContests(contests.filter((contest: Contest) => contest.id !== id));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Contests
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/contests/new">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
              Add
              <FolderPlusIcon
                className="-mr-0.5 ml-1 h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Type
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {contests.map((contest: Contest) => (
                    <tr key={contest.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {contest.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {contestTypeMap[contest.type!]}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/contests/${contest.id}`}
                          className="text-rose-600 hover:text-rose-900 mr-2">
                          Edit<span className="sr-only">, {contest.name}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(contest.id);
                          }}
                          className="text-rose-600 hover:text-rose-900 hover:cursor-pointer">
                          Delete
                          <span className="sr-only">, {contest.name}</span>
                        </button>
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
  );
};

export default Page;
