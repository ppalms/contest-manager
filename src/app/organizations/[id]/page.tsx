'use client';

import { Organization, GetOrganizationByIdQuery } from '@/graphql/API';
import { getOrganizationById } from '@/graphql/queries';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { useState, useEffect } from 'react';

export default function OrganizationDetail({ params }: any) {
  const [organization, setOrganization] = useState<Organization | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchOrg = async () => {
      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          getOrganizationById,
          { id: params.id },
          authHeader.Authorization
        )
      )) as { data: GetOrganizationByIdQuery };

      setOrganization(result.data.getOrganizationById as Organization);
    };

    fetchOrg();
  }, [params.id]);

  //   const handleSubmit = async (event: any) => {
  //     event.preventDefault();
  //     if (!organization) {
  //       return;
  //     }

  //     const result = (await API.graphql(
  //       graphqlOperation(updateOrganization, {
  //         organization: {
  //           id: organization.id,
  //           name: event.target.name.value,
  //           type: event.target.type.value,
  //         },
  //       })
  //     )) as { data: UpdateOrganizationMutation };

  //     setOrganization(result.data.updateOrganization!);
  //   };

  return (
    <>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Organization Details
        </h3>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 text-gray-900">
            Name
          </label>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={organization?.name}
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
