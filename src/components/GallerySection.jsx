import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Calendar, Instagram, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

export default function GallerySection({ onOpenBooking }) {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Hair Color', 'Styling', 'Haircuts', 'Treatments'];

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="gallery" className="py-20 bg-[#F5F0E9] border-t border-[#EAE3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
              Salon Portfolio
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614]">
              Real Salon Transformations
            </h2>
            <p className="text-sm sm:text-base text-[#5C5247] mt-3 max-w-2xl">
              Authentic work across custom balayage blonding, silk press thermal smoothing, textured cuts, and restorative treatments.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <a
              href="https://www.instagram.com/mj_hair_salon_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#191614] hover:text-[#9B7855] transition-colors py-2"
            >
              <Instagram className="w-4 h-4 text-[#9B7855]" />
              <span>More on @mj_hair_salon_</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#191614] text-white shadow-xs'
                  : 'bg-white text-[#4A423A] hover:bg-[#EAE3DB] border border-[#DDD3C7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#7D7166]">
            <div className="inline-block w-8 h-8 border-2 border-[#9B7855] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading gallery images...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-xl overflow-hidden bg-[#EAE3DB] border border-[#DDD3C7] shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer aspect-4/5"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#191614]/85 via-[#191614]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#CDB39A]">
                    {item.category}
                  </span>
                  <h3 className="text-base font-semibold text-white font-serif-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#EAE3DB] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 text-xs text-white">
                    <span className="inline-flex items-center gap-1 font-medium text-[#E0D7CD]">
                      <ZoomIn className="w-3.5 h-3.5" /> Tap to view
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenBooking) {
                          onOpenBooking(
                            item.serviceName ? { name: item.serviceName } : null,
                            { image: item.image, title: item.title, category: item.category }
                          );
                        }
                      }}
                      className="text-[11px] font-semibold text-[#191614] bg-white hover:bg-[#9B7855] hover:text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#9B7855] group-hover:text-white" />
                      <span>I Want This Look</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            id="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#191614]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-2xl border border-[#EAE3DB]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Close Lightbox"
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#191614]/80 text-white hover:bg-[#191614] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-72 md:h-[450px] bg-black">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#9B7855]">
                      {selectedImage.category}
                    </span>
                    <h3 className="text-2xl font-serif-display font-semibold text-[#191614] mt-1 mb-3">
                      {selectedImage.title}
                    </h3>
                    <p className="text-sm text-[#5C5247] leading-relaxed mb-4">
                      {selectedImage.description}
                    </p>

                    <div className="bg-[#F2EDE5] p-3.5 rounded-lg border border-[#DDD3C7] text-xs space-y-1">
                      <span className="font-semibold text-[#191614] block">Suggested Service:</span>
                      <span className="text-[#5C5247]">{selectedImage.serviceName || 'Personalized Consultation with Malvin'}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#EAE3DB] space-y-3">
                    <button
                      onClick={() => {
                        const lookService = selectedImage.serviceName;
                        const lookRef = {
                          image: selectedImage.image,
                          title: selectedImage.title,
                          category: selectedImage.category
                        };
                        setSelectedImage(null);
                        if (onOpenBooking) {
                          onOpenBooking(lookService ? { name: lookService } : null, lookRef);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-lg transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                      <span>I Want This Look</span>
                    </button>

                    <a
                      href="https://www.instagram.com/mj_hair_salon_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#7D7166] hover:text-[#9B7855]"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>View video on Instagram @mj_hair_salon_</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
