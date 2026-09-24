import React from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Clock, ExternalLink, Search, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenBooking, onOpenLookup, onOpenAdmin, salonInfo }) {
  return (
    <footer className="bg-[#191614] text-[#E0D7CD] pt-16 pb-24 md:pb-16 border-t border-[#2D2824]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/real/mj_logo_square.jpeg"
                alt="MJ Hair Salon Official Logo"
                className="w-11 h-11 rounded-full object-cover border border-[#4A3F35] shadow-xs"
              />
              <div>
                <h3 className="font-serif-display text-2xl font-bold tracking-tight text-white leading-none">
                  MJ HAIR SALON
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9B7855] mt-1">
                  Round Rock, TX &bull; Boutique Studio
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#A89D91] leading-relaxed">
              Led by master stylist Malvin Soto with over 20 years of experience. Dedicated to customized blonding, precision cuts, and restorative hair treatments.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/mj_hair_salon_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MJ Hair Salon Instagram"
                className="w-8 h-8 rounded-full bg-[#2A2420] text-[#D5C9BD] hover:text-[#9B7855] hover:bg-[#38302A] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={salonInfo?.contact?.whatsappUrl || "https://wa.me/13464468870"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Message"
                className="w-8 h-8 rounded-full bg-[#2A2420] text-[#D5C9BD] hover:text-[#2E7D32] hover:bg-[#38302A] flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`}
                aria-label="Phone Call"
                className="w-8 h-8 rounded-full bg-[#2A2420] text-[#D5C9BD] hover:text-white hover:bg-[#38302A] flex items-center justify-center transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A89D91]">
              <li>
                <a href="#home" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Services & Pricing</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">Salon Gallery</a>
              </li>
              <li>
                <a href="#inspiration" className="hover:text-white transition-colors">Hair Inspiration</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">About Malvin Soto</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Location & Directions</a>
              </li>
              {onOpenLookup && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenLookup}
                    className="hover:text-white text-[#9B7855] transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find My Booking</span>
                  </button>
                </li>
              )}
              {onOpenAdmin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="hover:text-white text-[#9B7855] transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Salon Owner Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Verified Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Salon Schedule
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#A89D91]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#9B7855] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Monday – Saturday</p>
                  <p className="text-xs text-[#8F7E70]">9:00 AM – 6:00 PM</p>
                  <p className="text-[11px] text-[#9B7855]">By Appointment Only</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#2D2824]">
                <p className="text-white font-medium">Sunday</p>
                <p className="text-xs text-[#8F7E70]">Closed</p>
              </div>
            </div>
          </div>

          {/* Col 4: Verified Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Round Rock Studio
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#A89D91]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#9B7855] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white">2000 I-35 Frontage Rd, Suite B2</p>
                  <p className="text-xs text-[#8F7E70]">Round Rock, TX 78681</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-[#9B7855] shrink-0" />
                <a href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`} className="text-white hover:text-[#9B7855] transition-colors">
                  +1 (346) 446-8870
                </a>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#191614] bg-white hover:bg-[#9B7855] hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-8 border-t border-[#2D2824] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D7166]">
          <p>
            &copy; {new Date().getFullYear()} MJ Hair Salon. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Round Rock, Texas</span>
            <span>&bull;</span>
            <a
              href="https://www.instagram.com/mj_hair_salon_/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram @mj_hair_salon_
            </a>
            <span>&bull;</span>
            <a
              href={salonInfo?.contact?.booksyUrl || "https://booksy.com/en-us/1655768_mj-hair-salon_hair-salon_37616_round-rock"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Booksy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
