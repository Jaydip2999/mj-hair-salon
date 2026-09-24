import React from 'react';
import { Award, CheckCircle2, Heart, Instagram } from 'lucide-react';

export default function AboutSection({ salonInfo }) {
  return (
    <section id="about" className="py-20 bg-[#F5F0E9] border-t border-[#EAE3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image & Stylist Profile */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-[#DDD3C7] bg-[#EAE3DB] aspect-4/5">
                <img
                  src={salonInfo?.stylistImage || "/assets/real/malvin_work_wa.jpg"}
                  alt="Malvin Soto, Master Stylist & Owner of MJ Hair Salon"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verified Badge Overlay */}
              <div className="absolute -bottom-5 -right-5 bg-white p-5 rounded-2xl shadow-lg border border-[#E0D7CD] max-w-[240px]">
                <p className="text-xs uppercase tracking-wider font-bold text-[#9B7855] mb-1">
                  Master Stylist & Owner
                </p>
                <p className="text-base font-serif-display font-semibold text-[#191614]">
                  Malvin Soto
                </p>
                <p className="text-xs text-[#6C5E51] mt-1">
                  20+ years of dedicated professional artistry in Texas.
                </p>
              </div>
            </div>
          </div>

          {/* Authentic Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
                About The Salon
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614] leading-tight">
                Passion, Artistry & Decades of Experience
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#5C5247] leading-relaxed">
              <p>
                <strong className="text-[#191614]">Malvin Soto</strong> is the owner and lead master stylist of MJ Hair Salon, bringing more than 20 years of hands-on salon experience to Round Rock, Texas. Her heartfelt mission is to help every client feel confident, refreshed, and truly beautiful.
              </p>
              <p>
                At MJ Hair Salon, we believe that the best hairstyles should not only turn heads on the outside, but also make you feel incredible on the inside. Whether crafting a multi-dimensional balayage, a featherlight silk press, or a frizz-defying nanoplasty treatment, we tailor every formula and shear stroke to your specific hair history and lifestyle.
              </p>
              <p>
                We continuously learn new techniques, master advanced color lines, and foster a welcoming boutique atmosphere where every client is greeted and treated like family.
              </p>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2D2824]">
                <CheckCircle2 className="w-4 h-4 text-[#9B7855] shrink-0" />
                <span>Continuous education & modern trends</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2D2824]">
                <CheckCircle2 className="w-4 h-4 text-[#9B7855] shrink-0" />
                <span>Health-first approach to color & heat</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2D2824]">
                <CheckCircle2 className="w-4 h-4 text-[#9B7855] shrink-0" />
                <span>Warm, welcoming boutique environment</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#2D2824]">
                <CheckCircle2 className="w-4 h-4 text-[#9B7855] shrink-0" />
                <span>All hair types, textures & lengths</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <a
                href="https://www.instagram.com/mj_hair_salon_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#191614] bg-white hover:bg-[#EAE3DB] border border-[#DDD3C7] rounded-lg transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#9B7855]" />
                <span>Follow Our Story @mj_hair_salon_</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
