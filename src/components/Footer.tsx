import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Spacia. All rights reserved.</p>
        <div className="flex gap-4 items-center">
        <a 
            href="https://github.com/Rahulgupta7777/nasa-space-project" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-200 flex items-center gap-1"
            aria-label="GitHub repository"
          >
            <Github size={18} /> GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
}