// app/auth/signin/page.tsx

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Section - Green Background */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a5f3f] to-[#2d7a52] relative p-12 flex-col justify-center items-center">
          {/* Logo */}
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                {/* Logo Icon */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Green Circle Background */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="#22c55e"
                      opacity="0.3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="#22c55e"
                      opacity="0.5"
                    />

                    {/* Arrow */}
                    <path
                      d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                      fill="#fbbf24"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* KlassMata Text */}
              <h1 className="text-5xl font-bold mb-3">
                <span className="text-[#22c55e]">KLASS</span>
                <span className="text-[#fbbf24]">MATA</span>
              </h1>
            </div>

            <p className="text-[#fbbf24] text-lg font-medium">
              Powered by KlassMata
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-[#1a5f3f]">KLASS</span>
              <span className="text-[#fbbf24]">MATA</span>
            </h1>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email / Username"
                required
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-left">
              <Link
                href="/auth/forgot-password"
                className="text-[#b8860b] hover:text-[#9a7209] font-medium text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#c9a961] hover:bg-[#b8973d] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Signing in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#1a5f3f] hover:text-[#2d7a52] font-semibold transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
          <Loader2 className="animate-spin h-8 w-8 text-[#1a5f3f]" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
