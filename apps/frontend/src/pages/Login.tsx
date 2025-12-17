import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isEmail = (input: string) => {
    return input.includes("@");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let email = formData.emailOrUsername;

      // If it's not an email, we need to look up the email by username
      if (!isEmail(formData.emailOrUsername)) {
        // For now, we'll show an error since we need to implement username lookup
        // In a real app, you'd query your user profiles table to get the email
        setError(
          "Please use your email address to sign in. Username login will be available soon."
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        toast.error(`Login Failed: ${error.message}`);
        setLoading(false);
      } else {
        toast.success("Welcome Back! You have successfully signed in.");
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("Login Failed: An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.emailOrUsername) {
      toast.error("Please enter your email address first");
      return;
    }

    if (!isEmail(formData.emailOrUsername)) {
      toast.error("Please enter your email address to reset password");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.emailOrUsername,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        toast.error(`Reset Failed: ${error.message}`);
      } else {
        toast.success(
          "Reset Email Sent! Check your email for password reset instructions"
        );
      }
    } catch (err) {
      toast.error("Reset Failed: An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="emailOrUsername"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address or Username"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-500">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
