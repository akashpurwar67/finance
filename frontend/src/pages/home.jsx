import { Link } from 'react-router-dom';
import { useState,useEffect } from 'react';
const Home = ({ isAuthenticated }) => {

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
      // Simulate loading for better transition
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }, []);
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-center mt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Take Control of Your</span>
          <span className="block text-indigo-600">Personal Finances</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          FinTrack helps you manage your money, track expenses, and achieve your financial goals.
        </p>
        <div className="mt-10 flex justify-center">
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/transactions"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
              >
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Why Choose FinTrack?</h2>
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Expense Tracking</h3>
            <p className="mt-2 text-base text-gray-500">
              Easily track all your expenses and income in one place with our intuitive interface.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Budget Planning</h3>
            <p className="mt-2 text-base text-gray-500">
              Set budgets for different categories and get alerts when you're approaching your limits.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Detailed Reports</h3>
            <p className="mt-2 text-base text-gray-500">
              Generate comprehensive reports to analyze your spending patterns and financial health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;