import { TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Page = () => {
  const releaseDetails = {
    name: '10-17-2023',
    summary: 'Added basic features for managing Contests and Organizations',
  };

  const features = [
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
  ];

  return (
    <>
      {/* <div className="lg:pr-8 lg:pt-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {"What's New"}
        </h2>
      </div> */}
      <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 xl:max-w-none xl:grid-cols-2">
        <div className="lg:max-w-lg">
          <h2 className="text-base font-semibold leading-7 text-rose-600">
            {"What's New"}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {releaseDetails.name}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {releaseDetails.summary}
          </p>
          <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
            {features.map((feature) => (
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
                  {feature.details?.map((detail) => (
                    <li key={detail} className="pl-9">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
};

export default Page;
