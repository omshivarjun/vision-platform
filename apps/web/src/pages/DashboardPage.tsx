import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Vision Platform Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Translation Services */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🌍</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Translation Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Active
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Services */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🤖</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        AI Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Running
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">♿</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Accessibility
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Enabled
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Start Translation
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Scene Analysis
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                Accessibility Mode
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
