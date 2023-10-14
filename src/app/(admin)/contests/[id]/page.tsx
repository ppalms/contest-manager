'use client';

import {
  Contest,
  ContestLevel,
  ContestType,
  GetContestQuery,
  SaveContestMutation,
} from '@/graphql/API';
import { saveContest } from '@/graphql/resolvers/mutations';
import { getAuthHeader } from '@/helpers';
import { API, graphqlOperation } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import TextInput from '@/components/TextInput';
import Notification from '@/components/Notification';
import { contestTypeMap, contestLevelMap } from '@/helpers';
import { getContest } from '@/graphql/resolvers/queries';

export default function ContestDetail({ params }: any) {
  const [contest, setContest] = useState<Contest | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [contestTypeError, setContestTypeError] = useState<string | null>(null);
  const [contestLevelError, setContestLevelError] = useState<string | null>(
    null
  );

  const [showNotification, setShowNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const router = useRouter();

  useEffect(() => {
    const loadContest = async () => {
      if (params.id === 'new') {
        setContest({
          id: v4(),
          name: '',
          type: ContestType.Unknown,
          level: ContestLevel.Unknown,
          startDate: new Date(),
          endDate: new Date(),
          signUpStartDate: new Date(),
          signUpEndDate: new Date(),
        });

        setIsValid(false);
        setLoading(false);
        return;
      }

      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          getContest,
          { id: params.id },
          authHeader.Authorization
        )
      )) as { data: GetContestQuery };

      setContest(result.data.getContest ?? null);
    };

    try {
      setLoading(true);
      loadContest().then(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [params.id]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ContestType;
    validateContestType(type);
    setContest({ ...contest!, type });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as ContestLevel;
    validateContestLevel(level);
    setContest({ ...contest!, level });
  };

  const validateContestName = (value: string) => {
    if (!value || value.length === 0) {
      setIsValid(false);
      return 'Name is required';
    }
    if (value.length < 3) {
      setIsValid(false);
      return 'Name must be at least 3 characters long';
    }
    setIsValid(true);
    return null;
  };

  const validateContestType: (type: ContestType) => boolean = (
    type: ContestType
  ) => {
    if (type === ContestType.Unknown) {
      setIsValid(false);
      setContestTypeError('Contest type is required');
      return false;
    } else {
      setIsValid(true);
      setContestTypeError(null);
      return true;
    }
  };

  const validateContestLevel: (level: ContestLevel) => boolean = (
    level: ContestLevel
  ) => {
    if (level === ContestLevel.Unknown) {
      setIsValid(false);
      setContestLevelError('Contest level is required');
      return false;
    } else {
      setIsValid(true);
      setContestLevelError(null);
      return true;
    }
  };

  const toUTCDate = (localDateStr: string) => {
    if (!localDateStr || localDateStr.length === 0) {
      return '';
    }

    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate()
    ).toISOString();
  };

  const validateDateInput = (dateStr: string, fieldName: string) => {
    if (!dateStr || dateStr.length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  };

  // TODO figure out event type
  const handleSaveContest = async (event: any) => {
    event.preventDefault();
    setSaving(true);

    const hasValidType = validateContestType(contest!.type);
    if (!hasValidType) {
      setSaving(false);
      return;
    }

    const hasValidLevel = validateContestLevel(
      contest!.level ?? ContestLevel.Unknown
    );
    if (!hasValidLevel) {
      setSaving(false);
      return;
    }

    // TODO validate dates

    try {
      const authHeader = await getAuthHeader();
      const result = (await API.graphql(
        graphqlOperation(
          saveContest,
          {
            contest: {
              id: contest?.id ?? v4(),
              name: event.target.name.value,
              type: event.target.type.value as ContestType,
              level: event.target.level.value as ContestLevel,
              startDate: toUTCDate(event.target.startDate?.value),
              endDate: toUTCDate(event.target.endDate?.value),
              signUpStartDate: toUTCDate(event.target.signUpStartDate?.value),
              signUpEndDate: toUTCDate(event.target.signUpEndDate?.value),
            },
          },
          authHeader.Authorization
        )
      )) as { data: SaveContestMutation };

      setContest(result.data.saveContest!);

      setNotificationTitle('Successfully saved!');
      setNotificationMessage(`${event.target.name.value} saved`);
      setNotificationType('success');
    } catch (error: any) {
      setNotificationTitle('Error saving');
      setNotificationMessage(error.message);
      setNotificationType('error');
    } finally {
      setSaving(false);
      setShowNotification(true);
    }
  };

  return (
    <>
      {/* Contest Details */}
      <div className="px-4 sm:px-6 lg:px-8 divide-y flex flex-col flex-grow">
        <form onSubmit={(e) => handleSaveContest(e)}>
          <div className="px-4 sm:px-0 flex items-center justify-between">
            <h3 className="text-base font-semibold leading-7 text-gray-900 flex">
              Contest Details
            </h3>

            <div className="flex justify-end gap-x-6">
              <button
                type="button"
                onClick={() => router.push('/contests')}
                className="text-sm font-semibold leading-6 text-gray-900">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || saving}
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
          </div>

          <fieldset disabled={loading} aria-busy={loading}>
            <div className="divide-y pb-10">
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Name */}
                <div className="sm:col-span-6">
                  <TextInput
                    label="Name"
                    type="text"
                    inputName="name"
                    inputValue={contest?.name || ''}
                    validate={validateContestName}
                  />
                </div>

                {/* Type */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:ring-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 ${
                      contestTypeError
                        ? 'ring-red-300 text-red-900 focus:ring-red-500'
                        : ''
                    }`}
                    value={contest?.type || ContestType.Unknown}
                    onChange={handleTypeChange}>
                    <option value={ContestType.Unknown}>
                      {loading ? '' : 'Select a type'}
                    </option>
                    <option value={ContestType.Orchestra}>
                      {contestTypeMap[ContestType.Orchestra]}
                    </option>
                    <option value={ContestType.MarchingBand}>
                      {contestTypeMap[ContestType.MarchingBand]}
                    </option>
                  </select>

                  {contestTypeError ? (
                    <p className="mt-2 text-sm text-red-600" id="input-error">
                      {contestTypeError}
                    </p>
                  ) : null}
                </div>

                {/* Level */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium leading-6 text-gray-900">
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:ring-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 ${
                      contestLevelError
                        ? 'ring-red-300 text-red-900 focus:ring-red-500'
                        : ''
                    }`}
                    value={contest?.level || ContestLevel.Unknown}
                    onChange={handleLevelChange}>
                    <option value={ContestLevel.Unknown}>
                      {loading ? '' : 'Select a level'}
                    </option>
                    <option value={ContestLevel.District}>
                      {contestLevelMap[ContestLevel.District]}
                    </option>
                    <option value={ContestLevel.State}>
                      {contestLevelMap[ContestLevel.State]}
                    </option>
                  </select>
                  {contestLevelError ? (
                    <p className="mt-2 text-sm text-red-600" id="input-error">
                      {contestLevelError}
                    </p>
                  ) : null}
                </div>

                {/* Scheduling info */}
                {/* Start Date */}
                <div className="sm:col-span-3">
                  <TextInput
                    label="Start Date"
                    type="date"
                    inputName="startDate"
                    inputValue={contest?.startDate ?? ''}
                    validate={(e) => validateDateInput(e, 'Start date')}
                  />
                </div>

                {/* End Date */}
                <div className="sm:col-span-3">
                  <TextInput
                    label="End Date"
                    type="date"
                    inputName="endDate"
                    inputValue={contest?.endDate || ''}
                    validate={(e) => validateDateInput(e, 'End date')}
                  />
                </div>

                {/* Signup Start Date */}
                <div className="sm:col-span-3">
                  <TextInput
                    label="Sign-up Start Date"
                    type="date"
                    inputName="signUpStartDate"
                    inputValue={contest?.signUpStartDate || ''}
                    validate={(e) => validateDateInput(e, 'Sign-up start date')}
                  />
                </div>

                {/* Signup End Date */}
                <div className="sm:col-span-3">
                  <TextInput
                    label="Sign-up End Date"
                    type="date"
                    inputName="signUpEndDate"
                    inputValue={contest?.signUpEndDate || ''}
                    validate={(e) => validateDateInput(e, 'Sign-up end date')}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </form>

        <div className="flex-grow">
          {!loading && contest?.id ? (
            <>
              {/* TODO move into user list component */}
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Entries
                  </h3>
                </div>
              </div>

              {/* <UserList
                users={[]}
                organizationId={contest.id}
                onUserSaved={(user) => {
                  setNotificationTitle('Successfully saved!');
                  setNotificationMessage(
                    `${user.firstName} ${user.lastName} saved`
                  );
                  setNotificationType('success');
                  setShowNotification(true);
                }}
              /> */}
            </>
          ) : (
            <></>
          )}

          {loading && (
            <div className="flex justify-center h-full pt-32">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-indigo-700" />
            </div>
          )}
        </div>
      </div>

      {showNotification && (
        <Notification
          title={notificationTitle}
          message={notificationMessage}
          show={showNotification}
          notificationType={notificationType}
          returnHref="/contests"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}
