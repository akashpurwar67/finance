import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and Password are required");
      return;
    }
    setError("");
    try {
      await login(formData);
      setError("somthing went wrong")
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
         
          <h1 className="text-3xl font-bold text-gray-800">FinTrack</h1>
          <p className="text-gray-600 mt-1">Take control of your finances</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Welcome Back
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
            {/* Error Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
                disabled={isLoggingIn}
              >
                {isLoggingIn && (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                )}
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          <div className="mt-1 space-x-4">
            <button className="hover:underline">Terms</button>
            <button className="hover:underline">Privacy</button>
            <button className="hover:underline">Security</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;