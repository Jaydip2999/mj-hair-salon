import React from 'react';
import { Calendar, MessageCircle, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ onOpenBooking, salonInfo }) {
  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Authentic Brand Positioning */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE9E0] border border-[#DDD3C7] text-xs font-semibold text-[#6C5E51] tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#9B7855]" />
              <span>ROUND ROCK, TX &bull; 20+ YEARS MASTER STYLING</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-display font-medium text-[#191614] leading-[1.12]">
                Elevated Hair Artistry, Tailored to You.
              </h1>
              <p className="text-lg sm:text-xl text-[#5C5247] max-w-2xl font-normal leading-relaxed">
                Led by owner and licensed master stylist <span className="font-semibold text-[#191614]">Malvin Soto</span> with over two decades of industry experience. Dedicated to healthy hair transformations, seamless balayage, precision cuts, and restorative treatments in a welcoming boutique atmosphere.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                id="hero-book-cta"
                onClick={() => onOpenBooking()}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-xl transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </button>

              <a
                id="hero-whatsapp-cta"
                href={salonInfo?.contact?.whatsappUrl || "https://wa.me/13464468870"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold text-[#2D2824] bg-[#FFFFFF] hover:bg-[#F2EDE5] border border-[#D5C9BD] rounded-xl transition-all duration-200 shadow-2xs hover:border-[#B5A596]"
              >
                <MessageCircle className="w-4 h-4 text-[#2E7D32]" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            {/* Quick Location & Direct Line Verification */}
            <div className="pt-4 border-t border-[#EAE3DB] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#6C5E51]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#9B7855] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#2D2824] block">Boutique Studio Address</span>
                  <span>{salonInfo?.address ? `${salonInfo.address.street}, ${salonInfo.address.city}, ${salonInfo.address.state}` : '2000 I-35 Frontage Rd, Suite B2, Round Rock, TX'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-[#2D2824] block">Appointment Booking</span>
                  <span>Mon – Sat by Appointment &bull; Call {salonInfo?.contact?.phone || '(346) 446-8870'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Imagery with Real Salon Focus */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E0D7CD] bg-[#F2EDE5] aspect-4/5">
                <img
                  src={salonInfo?.heroImage || "/assets/real/service_blonde_balayage.jpeg"}
                  alt="MJ Hair Salon Round Rock Master Balayage Work"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23FAF8F5'%3E%3Crect width='400' height='500' fill='%23F2EDE5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239B7855'%3EMJ Hair Salon%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191614]/75 via-transparent to-transparent pointer-events-none" />
                
                {/* Image Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={salonInfo?.logo || "/assets/real/mj_logo_square.jpeg"}
                        alt="MJ Hair Salon"
                        className="w-8 h-8 rounded-full object-cover border border-[#DDD3C7]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='%23FAF8F5'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23191614'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23FFFFFF'%3EMJ%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#9B7855]">{salonInfo?.owner || 'Malvin Soto'}</p>
                        <p className="text-sm font-semibold text-[#191614]">Master Stylist & Colorist</p>
                      </div>
                    </div>
                    <a
                      href={salonInfo?.contact?.instagram || "https://www.instagram.com/mj_hair_salon_/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#5C5247] hover:text-[#9B7855] underline underline-offset-2"
                    >
                      @mj_hair_salon_
                    </a>
                  </div>
                </div>
              </div>

              {/* Floating Experience Badge */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-[#E5DDD2] max-w-[240px]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#9B7855] font-serif font-bold text-sm">
                    ✦
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#7D7166] font-semibold">Master Stylist</p>
                    <p className="text-xs font-bold text-[#191614]">{salonInfo?.experienceYears || 20}+ Years Experience</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#6C5E51] leading-tight">
                  Dedicated 1-on-1 boutique care, precision styling, and customized healthy color formulas.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
