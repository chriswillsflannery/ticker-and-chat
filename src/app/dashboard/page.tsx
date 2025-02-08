"use client";
import { redirect } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      redirect("/");
    }
  }, [isAuthenticated, isLoading]);

  return isLoading ? (
    <></>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-16 max-w-[960px]">dash</main>
    </div>
  );
}
