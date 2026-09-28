import React from "react";

interface SalonHeroProps {
  onBookClick?: () => void;
  onExploreServices?: () => void;
}

export function SalonHero({ onBookClick, onExploreServices }: SalonHeroProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white py-16 sm:py-24">
      {/* Subtle warm glow background accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl space-y-6">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Today &bull; 9:00 AM &ndash; 7:00 PM</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-amber-400">Downtown Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            Bespoke Styling, Master Craftsmanship.
          </h1>

          <p className="text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Experience tailored cuts, balayage artistry, and revitalizing organic treatments from our award-winning team of master stylists.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onBookClick}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-amber-950/20 hover:scale-[1.02]"
            >
              Book Your Appointment
            </button>
            <button
              onClick={onExploreServices}
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-zinc-800 transition-colors"
            >
              View Menu & Pricing
            </button>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-800/80 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Certified Master Stylists</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>100% Organic Botanical Care</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Complimentary Consultations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
