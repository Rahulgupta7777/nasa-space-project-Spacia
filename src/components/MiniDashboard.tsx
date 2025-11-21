export default function MiniDashboardPreview() {
    return (
        <div className="rounded-lg overflow-hidden border border-slate-800/70 bg-slate-900/80 backdrop-blur-md shadow-lg">
            <div className="relative w-full h-64 bg-gradient-to-b from-slate-900 to-slate-950">

                <img
                    src="/minidasboard.png"
                    alt="Dashboard preview"
                    className="w-full h-full object-cover opacity-95"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            </div>

            <div className="p-3 text-xs text-slate-400">
                Quick dashboard preview from Spacia.
            </div>
        </div>
    );
}
