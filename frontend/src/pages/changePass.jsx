import { useState } from 'react';
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuthStore } from '../store/useAuthStore';

const ChangePasswordPage = () => {
  const {changePassword,error,success} = useAuthStore();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await changePassword(formData);
    setFormData({
      oldPassword: '',
      newPassword: '',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Change Password</h1>
            <p className="text-blue-100 text-sm mt-1">Secure your Finance Tracker account</p>
          </div>
          
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <div className="flex items-center">
                <FaExclamationCircle className="mr-2" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
              <div className="flex items-center">
                <FaCheckCircle className="mr-2" />
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form className="px-6 py-4" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="oldPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={'password'}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;