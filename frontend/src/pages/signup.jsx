import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    setError("");
    return true;
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    checkPasswordStrength(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await signup(formData);
      } catch (err) {
        setError(err.message || "Signup failed. Please try again.");
      }
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "bg-gray-200";
      case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Moderate";
      case 3: return "Strong";
      case 4: return "Very Strong";
      default: return "";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
      {/* Logo/Branding */}
        <div className="text-center mb-8">
         
          <h1 className="text-3xl font-bold text-gray-800">FinTrack</h1>
          <p className="text-gray-600 mt-1">Create your financial dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Create Your Account
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Password strength:{" "}
                        <span className="font-medium">
                          {getPasswordStrengthText()}
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                        style={{
                          width: `${(passwordStrength / 4) * 100}%`,
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>


              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center"
                disabled={isSigningUp}
              >
                {isSigningUp && (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                )}
                {isSigningUp ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;