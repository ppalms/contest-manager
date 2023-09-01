'use client';

import { API, Auth, graphqlOperation } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listOrganizations } from '@/graphql/queries';
import { Organization, OrganizationType } from '@/graphql/API';
import { getAuthHeader } from '@/helpers';

const Index = () => {
  const [organizations, setOrganizations] = useState([]);

  // Map for org type enum to display value
  const orgTypeMap = {
    [OrganizationType.DISTRICT]: 'District',
    [OrganizationType.NATIONAL]: 'National',
    [OrganizationType.SCHOOL]: 'School',
    [OrganizationType.STATE]: 'State',
    [OrganizationType.UNKNOWN]: 'Unknown',
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      const authHeader = await getAuthHeader();

      const result: GraphQLResult<any> = await API.graphql(
        graphqlOperation(listOrganizations),
        authHeader
      );

      setOrganizations(result.data.listOrganizations);
    };
    fetchOrgs();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Organizations
          </h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Add Organization
          </button>
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
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
                  {organizations.map((org: Organization) => (
                    <tr key={org.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {org.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {orgTypeMap[org.type!]}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/organizations/${org.id}`}
                          className="text-indigo-600 hover:text-indigo-900">
                          Edit<span className="sr-only">, {org.name}</span>
                        </Link>
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

export default Index;
