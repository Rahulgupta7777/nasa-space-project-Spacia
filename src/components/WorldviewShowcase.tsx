"use client";
import { useMemo, useRef, useEffect } from "react";
import { animate, stagger, cubicBezier } from "animejs";

export default function WorldviewShowcase() {
  const dateStr = useMemo(() => {
    const date = new Date();
    date.setFullYear(2024);
    return date.toISOString().slice(0, 10);
  }, []);
  
  const layers = [
    { name: "MODIS TrueColor", id: "MODIS_Terra_CorrectedReflectance_TrueColor" },
    { name: "VIIRS TrueColor", id: "VIIRS_SNPP_CorrectedReflectance_TrueColor" },
    { name: "MODIS Bands 3-6-7", id: "MODIS_Terra_CorrectedReflectance_Bands367" },
  ];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll(".wv-card");
    animate(cards as NodeListOf<Element>, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(100),
      duration: 600,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
    });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16" ref={ref}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">NASA Worldview Showcase</h2>
        {/* <div className="text-xs text-slate-400">Date: {dateStr}</div> */}
      </div>
      <p className="mt-2 text-slate-300 max-w-3xl">
        Explore recent Earth imagery layers from NASA GIBS. Open Worldview for full-resolution browsing
        or jump to EarthExplorer to search and download data products.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {layers.map((l) => {
          const src = `/api/gibs?wms=1&layer=${encodeURIComponent(l.id)}&time=${encodeURIComponent(dateStr)}&width=512&height=256`;
          return (
            <div key={l.id} className="wv-card rounded-lg border border-slate-800/60 glass-panel overflow-hidden">
              <div className="aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={l.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold text-slate-100">{l.name}</div>
                  <div className="text-slate-400">GIBS WMTS preview</div>
                </div>
                <a
                  href="https://worldview.earthdata.nasa.gov/"
                  target="_blank"
                  className="rounded border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
                >
                  Open Worldview
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-800/60 glass-panel p-4">
        <div>
          <div className="text-lg font-semibold text-slate-100">USGS EarthExplorer</div>
          <div className="text-sm text-slate-400">Search and download EO datasets by AOI, date range, and cloud cover.</div>
        </div>
        <a
          href="https://earthexplorer.usgs.gov/"
          target="_blank"
          className="button-secondary"
        >
          Open EarthExplorer
        </a>
      </div>
    </section>
  );
}