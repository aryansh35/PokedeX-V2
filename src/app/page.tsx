"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Redirection is now handled by src/middleware.ts
  useEffect(() => {
    // Keep as fallback or remove
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}
