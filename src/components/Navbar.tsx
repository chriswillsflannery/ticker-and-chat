"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { UserCircle } from "lucide-react";

export default function Navbar() {
  const { logout, isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <></>;
  }
  return (
    <nav className="flex items-center justify-between gap-4 py-4 px-12 absolute top-0 left-0 right-0">
      <span className="text-2xl font-bold">MorphyusAI</span>
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Button onClick={logout}>Logout</Button>
          {isAdmin && (
            <Button asChild variant="ghost">
              <Link href="/settings">
                <UserCircle />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </nav>
  );
}
