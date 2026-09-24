import React from 'react';
import { Calendar, MessageCircle, Phone } from 'lucide-react';

export default function MobileStickyBar({ onOpenBooking, salonInfo }) {
  return (
    <div
      id="mobile-sticky-cta"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#EAE3DB] px-4 py-2.5 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <button
          id="mobile-sticky-book-btn"
          onClick={() => onOpenBooking()}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-xl transition-colors shadow-xs"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>

        <a
          href={salonInfo?.contact?.whatsappUrl || "https://wa.me/13464468870"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact on WhatsApp"
          className="p-3 bg-[#E8F3EB] text-[#1A4D2E] border border-[#C5DEC9] rounded-xl hover:bg-[#D7ECD8] transition-colors flex items-center justify-center shrink-0"
        >
          <MessageCircle className="w-5 h-5 text-[#2E7D32]" />
        </a>

        <a
          href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`}
          aria-label="Call MJ Hair Salon"
          className="p-3 bg-[#F2EDE5] text-[#2D2824] border border-[#DDD3C7] rounded-xl hover:bg-[#EAE3DB] transition-colors flex items-center justify-center shrink-0"
        >
          <Phone className="w-5 h-5 text-[#9B7855]" />
        </a>
      </div>
    </div>
  );
}
