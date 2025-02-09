'use client'

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../util/axios";

type UserProfile = {
  username: string;
  role: string;
  message: string;
}

export default function Settings() {
  const { accessToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const getProfile = async () => {
      try {
        const res = await api.get("/profile", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
        });

        if (res.status !== 200) {
          setError("Failed to fetch profile");
          return;
        }

        const data = await res.data;
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setProfile(null);
      }
    }

    getProfile();
  }, [accessToken])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-16 max-w-[960px] mt-16">

        {error ? (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : profile ? (
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg backdrop-blur-sm">
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <label className="text-sm text-gray-400">Username</label>
                <p className="text-lg font-medium">{profile.username}</p>
              </div>
              
              <div className="border-b border-gray-700 pb-4">
                <label className="text-sm text-gray-400">Role</label>
                <p className="text-lg font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {profile.role}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Message</label>
                <p className="text-lg font-medium">{profile.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </main>
    </div>
  );
}
