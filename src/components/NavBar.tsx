"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Satellite, AlertTriangle, Globe2 } from "lucide-react";

export default function NavBar() {
  const { data: session } = useSession();
  // Default theme remains dark; toggle removed per request.
  return (
    <header className="sticky top-0 z-30 glass-panel">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Globe2 className="text-slate-300" size={22} />
          <span className="font-semibold tracking-wide">Spacia</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="hover:text-slate-200 flex items-center gap-1">
            <Satellite size={18} /> Dashboard
          </Link>
          <Link href="/planner" className="hover:text-slate-200">Launch Planner</Link>
          <Link href="/business" className="hover:text-slate-200">Business</Link>
          <Link href="/about" className="hover:text-slate-200">About</Link>
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