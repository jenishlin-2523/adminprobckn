"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

export default function AuthPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ALLOWED_EMAIL = "jenishlinb@gmail.com";

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if the user's email matches the allowed whitelist
      if (result.user.email !== ALLOWED_EMAIL) {
        await signOut(auth); // deny access
        setError(`Access denied. Only ${ALLOWED_EMAIL} is authorized.`);
        setLoading(false);
        return;
      }
      
      // Authorized
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-50 mb-6 border border-orange-100 shadow-sm">
             <Mail className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to Admin<span className="text-orange-500">Pro</span>
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Secure admin access restricted to owner accounts.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-center border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative flex w-full justify-center items-center rounded-xl bg-white border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center space-x-3">
                <div className="animate-spin h-5 w-5 border-b-2 border-orange-500 rounded-full"></div>
                <span>Securing session...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                <span>Sign in with Google</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
