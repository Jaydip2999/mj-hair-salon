import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Calendar, Menu, X, Instagram, Search, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenBooking, onOpenLookup, onOpenAdmin, salonInfo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Inspiration', href: '#inspiration' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (href) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-[#EAE3DB] py-3'
          : 'bg-[#FAF8F5] py-4 border-b border-[#EAE3DB]/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <a
            href="#home"
            className="group flex items-center gap-3 focus:outline-hidden"
            id="brand-logo"
          >
            <img
              src="/assets/real/mj_logo_square.jpeg"
              alt="MJ Hair Salon Official Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#DDD3C7] shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-[#191614] group-hover:text-[#9B7855] transition-colors leading-none">
                MJ HAIR SALON
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium text-[#7D7166] mt-1">
                Round Rock, TX &bull; Boutique Studio
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" id="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="text-[14px] font-medium text-[#4A423A] hover:text-[#9B7855] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9B7855] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Quick Actions Desktop */}
          <div className="hidden lg:flex items-center gap-2.5">
            {onOpenLookup && (
              <button
                type="button"
                onClick={onOpenLookup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C5247] hover:text-[#191614] hover:bg-[#EFE9E0] rounded-lg transition-colors border border-transparent hover:border-[#DDD3C7]"
                title="Lookup existing appointment"
              >
                <Search className="w-3.5 h-3.5 text-[#9B7855]" />
                <span>My Booking</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C5247] hover:text-[#191614] hover:bg-[#EFE9E0] rounded-lg transition-colors border border-transparent hover:border-[#DDD3C7]"
                title="Salon Owner Login & Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#9B7855]" />
                <span>Owner Portal</span>
              </button>
            )}

            <a
              href="https://www.instagram.com/mj_hair_salon_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MJ Hair Salon Instagram"
              className="p-2 text-[#5C5247] hover:text-[#9B7855] hover:bg-[#EFE9E0] rounded-full transition-colors"
              title="Follow @mj_hair_salon_ on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <a
              href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3D352E] hover:text-[#191614] bg-[#F2EDE5] hover:bg-[#EAE3DB] rounded-lg transition-colors border border-[#DDD3C7]"
              title="Call salon"
            >
              <Phone className="w-3.5 h-3.5 text-[#9B7855]" />
              <span>(346) 446-8870</span>
            </a>

            <button
              id="header-book-btn"
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="header-book-btn-mobile-quick"
              onClick={() => onOpenBooking()}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] rounded-md hover:bg-[#9B7855] transition-colors"
            >
              Book
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2D2824] hover:bg-[#EFE9E0] rounded-md transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden bg-[#FAF8F5] border-b border-[#EAE3DB] px-4 pt-4 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2"
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="px-3 py-2 text-sm font-medium text-[#2D2824] hover:bg-[#F2EDE5] rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EAE3DB] flex flex-col gap-2">
            <button
              id="mobile-drawer-book-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] rounded-lg shadow-xs hover:bg-[#9B7855] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {onOpenLookup && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLookup();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#2D2824] bg-white border border-[#DDD3C7] rounded-lg"
                >
                  <Search className="w-3.5 h-3.5 text-[#9B7855]" />
                  <span>Find Booking</span>
                </button>
              )}

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#2D2824] bg-white border border-[#DDD3C7] rounded-lg"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9B7855]" />
                  <span>Owner Portal</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#2D2824] bg-[#F2EDE5] border border-[#DDD3C7] rounded-lg"
              >
                <Phone className="w-3.5 h-3.5 text-[#9B7855]" />
                <span>Call Salon</span>
              </a>
              <a
                href={salonInfo?.contact?.whatsappUrl || "https://wa.me/13464468870"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#1A4D2E] bg-[#E8F3EB] border border-[#C5DEC9] rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>WhatsApp</span>
              </a>
            </div>

            <a
              href="https://www.instagram.com/mj_hair_salon_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-[#5C5247] hover:text-[#9B7855]"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @mj_hair_salon_ on Instagram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
