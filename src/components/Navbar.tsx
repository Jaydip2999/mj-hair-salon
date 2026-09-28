import React, { useState } from "react";

interface NavbarProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenBooking?: () => void;
}

export function Navbar({ activeTab = "home", onNavigate, onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services & Pricing" },
    { id: "stylists", label: "Our Stylists" },
    { id: "admin", label: "Staff Portal" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div
          onClick={() => handleNav("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-amber-100 flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:scale-105 transition-transform">
            MJ
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-zinc-900 block leading-tight">
              MJ Hair Salon
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block">
              Bespoke Hair Studio
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`transition-colors py-1 ${
                activeTab === item.id
                  ? "text-zinc-950 font-semibold border-b-2 border-amber-600"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:+15552345678"
            className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
          >
            (555) 234-5678
          </a>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-50 text-sm font-medium transition-all shadow-xs hover:shadow"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 rounded-md bg-zinc-900 text-amber-100 text-xs font-medium"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full text-left py-2 text-base font-medium text-zinc-700 hover:text-zinc-950"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-lg bg-zinc-900 text-amber-50 text-center font-medium text-sm"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
