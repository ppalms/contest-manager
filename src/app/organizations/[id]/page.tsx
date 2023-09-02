'use client';

import {
  Organization,
  GetOrganizationByIdQuery,
  UpdateOrganizationMutation,
  OrganizationType,
  CreateOrganizationMutation,
} from '@/graphql/API';
import { createOrganization, updateOrganization } from '@/graphql/mutations';
import { getOrganizationById } from '@/graphql/queries';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import { orgTypeMap } from '../../../org-type-map';
import TextInput from '@/components/TextInput';

export default function OrganizationDetail({ params }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const router = useRouter();

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

    try {
      setLoading(true);

      fetchOrg();
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      setSaving(true);
      const authHeader = await getAuthHeader();

      if (organization?.id) {
        const result = (await API.graphql(
          graphqlOperation(
            updateOrganization,
            {
              organization: {
                id: organization!.id,
                name: event.target.name.value,
                type: event.target.type.value as OrganizationType,
              },
            },
            authHeader.Authorization
          )
        )) as { data: UpdateOrganizationMutation };

        setOrganization(result.data.updateOrganization!);
      } else {
        const result = (await API.graphql(
          graphqlOperation(
            createOrganization,
            {
              organization: {
                id: v4(),
                name: event.target.name.value,
                type: event.target.type.value as OrganizationType,
              },
            },
            authHeader.Authorization
          )
        )) as { data: CreateOrganizationMutation };

        setOrganization(result.data.createOrganization!);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Organization Details
        </h3>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <fieldset disabled={loading} aria-busy={loading}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <TextInput
                label="Name"
                type="text"
                inputName="name"
                defaultValue={organization?.name}></TextInput>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="type"
                className="block text-sm font-medium leading-6 text-gray-900">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={organization?.type || OrganizationType.SCHOOL}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const type = e.target.value as OrganizationType;
                  setOrganization({ ...organization!, type });
                }}>
                <option value={OrganizationType.STATE}>
                  {orgTypeMap[OrganizationType.STATE]}
                </option>
                <option value={OrganizationType.DISTRICT}>
                  {orgTypeMap[OrganizationType.DISTRICT]}
                </option>
                <option value={OrganizationType.SCHOOL}>
                  {orgTypeMap[OrganizationType.SCHOOL]}
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-semibold leading-6 text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {saving ? (
                <>
                  Saving
                  <svg
                    className="animate-spin -mr-0.5 ml-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
