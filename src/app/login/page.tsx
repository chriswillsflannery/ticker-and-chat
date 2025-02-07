"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});
type LoginFormInputs = z.infer<typeof loginSchema>;

type FormResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  message?: string;
};

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/challenge/api/login`, {
        method: "POST",
        body: formData,
      });

      const responseData = await res.json() as FormResponse;

      if (!res.ok) {
        setError(responseData.message || 'Login failed. Please check your credentials.');
        return;
      }

      login(responseData.access_token);
      router.push("/dashboard");
    } catch {
      setError('An unexpected error occurred. Please try again later.');
      // TODO: punt error to logging service
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-gray-900 to-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-black/30 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className={`w-full px-4 py-3 rounded-lg bg-gray-900/50 border ${errors.username ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 outline-none`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={`w-full px-4 py-3 rounded-lg bg-gray-900/50 border ${errors.password ? "border-red-500" : "border-gray-700"} focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 outline-none`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium 
            hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
            transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
