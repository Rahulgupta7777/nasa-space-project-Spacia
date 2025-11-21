"use client";
import { useMemo, useRef, useEffect, useState, SyntheticEvent } from "react";
import { animate, stagger, cubicBezier } from "animejs";

export default function WorldviewShowcase({ compact = false }) {
  const dateStr = useMemo(() => {
    const date = new Date();
    date.setFullYear(2024); // stable demo date
    return date.toISOString().slice(0, 10);
  }, []);

  const layers = [
    { name: "MODIS TrueColor", id: "MODIS_Terra_CorrectedReflectance_TrueColor" },
    { name: "VIIRS TrueColor", id: "VIIRS_SNPP_CorrectedReflectance_TrueColor" },
    { name: "MODIS Bands 3-6-7", id: "MODIS_Terra_CorrectedReflectance_Bands367" },
  ];

  const ref = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null); // id of open layer for modal

  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll(".wv-card");
    animate(cards, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(100),
      duration: 600,
      ease: cubicBezier(0.22, 0.9, 0.28, 0.99),
    });
  }, []);

  const onImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/placeholder-512x256.png";
    e.currentTarget.alt = "Preview not available";
  };

  if (compact) {
    const l = layers[0];
    const src = `/api/gibs?wms=1&layer=${encodeURIComponent(l.id)}&time=${encodeURIComponent(dateStr)}&width=640&height=360`;
    return (
      <div className="p-2" aria-label="Worldview quick preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${l.name} preview ${dateStr}`} className="w-full h-48 object-cover block" loading="lazy" onError={onImgError} />
      </div>
    );
  }

  return (
    <section ref={ref} aria-labelledby="worldview-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="worldview-heading" className="text-xl font-semibold">NASA Worldview Showcase</h2>
        <div className="text-xs text-slate-400">Date: {dateStr}</div>
      </div>

      <p className="mt-2 text-slate-300 max-w-3xl">Explore recent Earth imagery layers from NASA GIBS. Click any preview to open a larger image.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {layers.map((l) => {
          const src = `/api/gibs?wms=1&layer=${encodeURIComponent(l.id)}&time=${encodeURIComponent(dateStr)}&width=1024&height=512`;
          return (
            <article key={l.id} className="wv-card rounded-lg border border-slate-800/60 overflow-hidden bg-slate-900/30" role="article">
              <div className="aspect-video bg-black cursor-pointer" onClick={() => setOpen(l.id)} onKeyDown={(e) => { if (e.key === "Enter") setOpen(l.id); }} tabIndex={0} aria-label={`Open ${l.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${l.name} — ${dateStr}`} className="h-full w-full object-cover" loading="lazy" onError={onImgError} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100">{l.name}</div>
                  <div className="text-slate-400 text-sm">GIBS preview</div>
                </div>
                <a href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer" className="rounded border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800">
                  Open Worldview
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-800/60 p-4">
        <div>
          <div className="text-lg font-semibold">USGS EarthExplorer</div>
          <div className="text-sm text-slate-400">Search and download EO datasets by AOI, date range, and cloud cover.</div>
        </div>
        <a href="https://earthexplorer.usgs.gov/" target="_blank" rel="noreferrer" className="button-secondary">Open EarthExplorer</a>
      </div>

      {/* Simple modal for full-size preview */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true">
          <div className="max-w-4xl w-full rounded-lg overflow-hidden bg-slate-900">
            <div className="aspect-video bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/gibs?wms=1&layer=${encodeURIComponent(open)}&time=${encodeURIComponent(dateStr)}&width=2048&height=1024`} alt={`${open} full`} className="w-full h-full object-cover" onError={onImgError} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-slate-200">Layer: {layers.find((x) => x.id === open)?.name || open}</div>
              <button onClick={() => setOpen(null)} className="rounded px-3 py-1 bg-slate-800 hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}