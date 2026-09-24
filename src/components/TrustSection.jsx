import React from 'react';
import { Award, HeartHandshake, Sparkles, ShieldCheck } from 'lucide-react';

export default function TrustSection() {
  const pillars = [
    {
      icon: Award,
      title: "20+ Years Master Experience",
      description: "Founded and operated by licensed master stylist Malvin Soto, bringing over two decades of refined technique and continuous education."
    },
    {
      icon: Sparkles,
      title: "Dimensional Color & Blonding",
      description: "Specialized in seamless balayage, custom highlights, toner glossing, and healthy color transformations that grow out naturally."
    },
    {
      icon: ShieldCheck,
      title: "Hair Health & Repair Focus",
      description: "Organic Nanoplasty smoothing, Olaplex bond-building formulations, and heat-protective Silk Press techniques tailored to your texture."
    },
    {
      icon: HeartHandshake,
      title: "Personalized Boutique Care",
      description: "Every visit is a 1-on-1 consultation in a welcoming environment where clients are treated like family with thorough attention to detail."
    }
  ];

  return (
    <section className="py-16 bg-[#F5F0E9] border-y border-[#EAE3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
            Why MJ Hair Salon
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif-display font-semibold text-[#191614]">
            Craftsmanship Rooted in Integrity
          </h2>
          <p className="text-sm sm:text-base text-[#5C5247] mt-3">
            Real expertise, proven techniques, and a true commitment to the longevity and vibrancy of your hair.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-xs p-6 rounded-xl border border-[#E2D8CC] hover:border-[#9B7855]/60 transition-colors shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E0D7CD] flex items-center justify-center text-[#9B7855] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#191614] mb-2 font-serif-display">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6C5E51] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
