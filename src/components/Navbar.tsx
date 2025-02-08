'use client';
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { logout, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <></>
  }
  return (
    <nav className="flex items-center justify-between gap-4 py-4 px-12 absolute top-0 left-0 right-0">
      <span className="text-2xl font-bold">
        MorphyusAI
      </span>
      {isAuthenticated ? (
        <Button onClick={logout}>Logout</Button>
      ) : (
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </nav>
  );
}
