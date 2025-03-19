// app/console/components/tabs/ServicesTab.tsx
export default function ServicesTab() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Available Services
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Choose from our range of cloud services
        </p>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Compute Engine Card */}
          <ServiceCard
            title="Compute Engine"
            description="High-performance virtual machines running in our global data centers with flexible configurations."
            icon={
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                ></path>
              </svg>
            }
            iconBgColor="bg-blue-50"
            buttonColor="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          />

          {/* Cloud Storage Card */}
          <ServiceCard
            title="Cloud Storage"
            description="Durable and highly available object storage for any amount of data with global edge caching."
            icon={
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                ></path>
              </svg>
            }
            iconBgColor="bg-green-50"
            buttonColor="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          />

          {/* Database Services Card */}
          <ServiceCard
            title="Database Services"
            description="Fully managed relational and non-relational databases with automatic scaling and high availability."
            icon={
              <svg
                className="w-16 h-16 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                ></path>
              </svg>
            }
            iconBgColor="bg-yellow-50"
            buttonColor="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
          />

          {/* Identity & Security Card */}
          <ServiceCard
            title="Identity & Security"
            description="Authentication, authorization, and security services to protect your infrastructure and applications."
            icon={
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            }
            iconBgColor="bg-red-50"
            buttonColor="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          />

          {/* Network Services Card */}
          <ServiceCard
            title="Network Services"
            description="Scalable, secure network connectivity with load balancing, DNS, CDN, and private network options."
            icon={
              <svg
                className="w-16 h-16 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                ></path>
              </svg>
            }
            iconBgColor="bg-indigo-50"
            buttonColor="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          />

          {/* Machine Learning Card */}
          <ServiceCard
            title="Machine Learning"
            description="Build, train, and deploy machine learning models at scale with pre-built APIs and custom training options."
            icon={
              <svg
                className="w-16 h-16 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            }
            iconBgColor="bg-purple-50"
            buttonColor="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  buttonColor: string;
}

function ServiceCard({
  title,
  description,
  icon,
  iconBgColor,
  buttonColor,
}: ServiceCardProps) {
  return (
    <div className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`p-6 ${iconBgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button
          className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Learn more
          <svg
            className="ml-2 -mr-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
