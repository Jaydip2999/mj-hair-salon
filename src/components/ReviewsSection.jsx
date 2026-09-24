import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Instagram, ShieldCheck, ExternalLink, CheckCircle } from 'lucide-react';

export default function ReviewsSection({ salonInfo }) {
  const [reviews, setReviews] = useState([]);
  const [booksyUrl, setBooksyUrl] = useState('https://booksy.com/en-us/1655768_mj-hair-salon_hair-salon_37616_round-rock');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        }
        if (data.booksyUrl) {
          setBooksyUrl(data.booksyUrl);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    }
    fetchReviews();
  }, []);

  const activeBooksyUrl = salonInfo?.contact?.booksyUrl || booksyUrl;
  const instagramUrl = salonInfo?.contact?.instagram || "https://www.instagram.com/mj_hair_salon_/";

  return (
    <section id="reviews" className="py-20 bg-[#FAF8F5] border-t border-[#EAE3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
            Client Experiences
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614]">
            Verified Client Reviews
          </h2>
          <p className="text-sm text-[#5C5247] mt-3">
            Real feedback and authentic hair transformation stories from our salon clients.
          </p>
        </div>

        {/* Local Client Reviews Grid (if present) */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-[#E5DDD2] p-6 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#9B7855]">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32] bg-[#E8F3EB] px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified Client
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A423A] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F2EDE5] flex items-center justify-between text-xs text-[#7D7166]">
                  <div>
                    <span className="font-semibold text-[#191614] block">{rev.author}</span>
                    {rev.service && <span className="text-[11px] text-[#9B7855]">{rev.service}</span>}
                  </div>
                  <span className="text-[11px]">{rev.date || 'Verified Visit'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Authentic Review Hub Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E5DDD2] p-8 sm:p-10 shadow-2xs text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F0E9] text-[#9B7855] mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-serif-display font-semibold text-[#191614]">
              Explore Real Client Transformations & Testimonials
            </h3>
            <p className="text-sm text-[#6C5E51] leading-relaxed max-w-xl mx-auto">
              Our verified client reviews, client comments, and before-and-after transformations are actively hosted on our official Booksy booking profile and Instagram feed.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-xl transition-colors shadow-xs"
            >
              <Instagram className="w-4 h-4" />
              <span>Client Work on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href={activeBooksyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-[#2D2824] bg-[#F2EDE5] hover:bg-[#EAE3DB] border border-[#DDD3C7] rounded-xl transition-colors"
            >
              <Star className="w-4 h-4 text-[#9B7855]" />
              <span>Read Client Reviews on Booksy</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
