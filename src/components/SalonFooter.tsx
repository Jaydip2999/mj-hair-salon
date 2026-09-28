import React from "react";

export function SalonFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
          {/* Brand Col */}
          <div className="space-y-4">
            <span className="font-serif font-bold text-xl text-white block">MJ Hair Salon</span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dedicated to the fine art of hairdressing, color precision, and exceptional hospitality since 2018.
            </p>
            <span className="text-[11px] text-amber-500 font-medium block">
              Instagram: @mjhairsalonofficial
            </span>
          </div>

          {/* Hours Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Studio Hours</h4>
            <ul className="text-xs space-y-1.5 text-zinc-400">
              <li className="flex justify-between"><span>Mon &ndash; Fri:</span> <span className="text-zinc-200">9:00 AM &ndash; 7:30 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span className="text-zinc-200">9:00 AM &ndash; 6:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span className="text-zinc-200">10:00 AM &ndash; 4:00 PM</span></li>
            </ul>
          </div>

          {/* Location Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Location & Contact</h4>
            <p className="text-xs leading-relaxed text-zinc-400">
              428 Grand Avenue, Suite 100<br />
              Metro Arts District, CA 90210
            </p>
            <p className="text-xs text-zinc-300">
              Phone: (555) 234-5678<br />
              Email: appointments@mjhairsalon.com
            </p>
          </div>

          {/* Booking Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Appointments</h4>
            <p className="text-xs leading-relaxed text-zinc-400">
              Online appointments can be booked up to 30 days in advance. Free cancellation up to 24 hours prior.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>&copy; {new Date().getFullYear()} MJ Hair Salon & Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
