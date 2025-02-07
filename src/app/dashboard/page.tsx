"use client";
import { useAuth } from "../context/AuthContext";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const context = useAuth();
  console.log(context);
  if (!context.authToken) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900 text-foreground">
      a little dashboard will do ya
    </div>
  )
}

