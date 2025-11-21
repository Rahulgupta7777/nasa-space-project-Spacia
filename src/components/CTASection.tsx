import Link from "next/link";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-xl border border-slate-800/60 bg-gradient-to-br from-[#071018] to-slate-900 p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-100">Build a Responsible LEO Business</h3>
        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Visualize orbits, monitor conjunctions, and plan sustainable operations with our integrated planning tools.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/dashboard" className="inline-block rounded-md px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-900 font-semibold shadow hover:scale-[1.02]">
            Launch Dashboard
          </Link>
          <Link href="/business" className="inline-block rounded-md px-6 py-3 border border-slate-700 text-slate-200 hover:bg-slate-800">
            Explore Business
          </Link>
        </div>
      </div>
    </section>
  );
}