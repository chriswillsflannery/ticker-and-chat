"use client";
import { redirect } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      console.log("not authed");
      redirect("/");
    }

    if (!isAdmin) {
      console.log("not admin");
      redirect("/dashboard");
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  if (isLoading || !isAdmin || !isAuthenticated) return <></>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-16 max-w-[960px]">
        <div>NAUGHTY NAUGHTY</div>
      </main>
    </div>
  );
}
