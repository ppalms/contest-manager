import {
  TrophyIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Page = () => {
  const releaseDetails = {
    name: '10-17-2023',
    summary: 'Added basic features for managing Contests and Organizations',
  };

  const releases: any[] = [
    {
      name: '11-09-2023',
      summary: 'Added school classification selection for classes 1A - 6A',
      features: [
        {
          name: 'Organizations',
          details: ["Set classification on 'School' type organizations"],
          icon: UserGroupIcon,
        },
      ],
    },
    {
      name: '11-01-2023',
      summary:
        'Added Users module and the ability to assign users to contests and organizations',
      features: [
        {
          name: 'Users',
          details: ['User account management has moved to its own module'],
          icon: UserCircleIcon,
        },
        {
          name: 'Organizations',
          details: ['Assign members to organizations'],
          icon: UserGroupIcon,
        },
        {
          name: 'Contests',
          details: ['Assign managers to contests'],
          icon: TrophyIcon,
        },
      ],
    },
    {
      name: '10-17-2023',
      summary: 'Added basic features for managing Contests and Organizations',
      features: [
        {
          name: 'Contests',
          description: '',
          details: ['Create, edit, and delete contests'],
          icon: TrophyIcon,
        },
        {
          name: 'Organizations',
          description: '',
          details: [
            'Create, edit, and delete organizations',
            'Create user accounts for Contest Managers and Directors',
          ],
          icon: UserGroupIcon,
        },
      ],
    },
  ];

  return (
    <>
      <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 xl:max-w-none xl:grid-cols-2">
        <div className="lg:max-w-lg">
          <h2 className="text-base font-semibold leading-7 text-rose-600">
            {"What's New"}
          </h2>
          {releases.map((releaseDetails) => {
            return (
              <>
                <div className="mb-12">
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {releaseDetails.name}
                  </p>
                  <p className="mt-2 text-lg leading-8 text-gray-600">
                    {releaseDetails.summary}
                  </p>
                  <dl className="mt-6 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                    {releaseDetails.features.map((feature: any) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900">
                          <feature.icon
                            className="absolute left-1 top-1 h-5 w-5 text-rose-600"
                            aria-hidden="true"
                          />
                          {feature.name}
                        </dt>{' '}
                        <dd className="inline">{feature.description}</dd>
                        <ul>
                          {feature.details?.map((detail: any) => (
                            <li key={detail} className="pl-9">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Page;
