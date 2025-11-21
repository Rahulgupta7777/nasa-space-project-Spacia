"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Satellite } from "lucide-react";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Helper function to check if a nav item is active
  const isActive = (path: string) => pathname === path;

  // Default theme remains dark; toggle removed per request.
  return (
    <header className="sticky top-0 z-30 glass-panel">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-wide">Spacia</span>
        </Link>
        <nav className="flex items-center gap-6 text-base">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1 transition-colors ${
              isActive('/dashboard')
                ? 'text-white font-semibold border-b-2 border-white'
                : 'hover:text-slate-200'
            }`}
          >
            <Satellite size={18} /> Dashboard
          </Link>
          <Link
            href="/planner"
            className={`transition-colors ${
              isActive('/planner')
                ? 'text-white font-semibold border-b-2 border-white'
                : 'hover:text-slate-200'
            }`}
          >
            Launch Planner
          </Link>
          <Link
            href="/spaceweather"
            className={`transition-colors ${
              isActive('/spaceweather')
                ? 'text-white font-semibold border-b-2 border-white'
                : 'hover:text-slate-200'
            }`}
          >
            Space Weather
          </Link>
          <Link
            href="/business"
            className={`transition-colors ${
              isActive('/business')
                ? 'text-white font-semibold border-b-2 border-white'
                : 'hover:text-slate-200'
            }`}
          >
            Business
          </Link>
          {session ? (
            <button onClick={() => signOut()} className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-800">Sign out</button>
          ) : (
            <button onClick={() => signIn("github")} className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-800">Sign in</button>
          )}
        </nav>
      </div>
    </header>
  );
}