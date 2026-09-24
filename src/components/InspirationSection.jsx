import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function InspirationSection({ onOpenBooking }) {
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Haircuts', 'Styling', 'Hair Color', 'Treatments'];

  useEffect(() => {
    async function loadInspiration() {
      try {
        setLoading(true);
        const res = await fetch('/api/inspiration');
        const data = await res.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (err) {
        console.error('Failed to load inspiration:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInspiration();
  }, []);

  const filteredItems = categoryFilter === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <section id="inspiration" className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
            Style Catalog
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614]">
            Find Your Next Hair Inspiration
          </h2>
          <p className="text-sm sm:text-base text-[#5C5247] mt-3">
            Browse our signature looks tailored to your lifestyle, texture, and aesthetic goals. Tap &ldquo;Book This Look&rdquo; to reserve your consultation.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#191614] text-white shadow-xs'
                  : 'bg-[#F2EDE5] text-[#4A423A] hover:bg-[#EAE3DB] border border-[#DDD3C7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-[#7D7166]">
            <p className="text-sm">Loading inspiration looks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden border border-[#E5DDD2] shadow-2xs hover:shadow-md hover:border-[#9B7855] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 w-full overflow-hidden bg-[#F2EDE5]">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-[#191614]/85 text-white backdrop-blur-xs rounded-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold font-serif-display text-[#191614] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6C5E51] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      if (onOpenBooking) {
                        onOpenBooking(
                          { id: item.serviceId, name: item.serviceName },
                          { image: item.image, title: item.title, category: item.category }
                        );
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-[#191614] hover:text-white bg-[#F2EDE5] hover:bg-[#191614] rounded-lg transition-colors border border-[#DDD3C7] cursor-pointer min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#9B7855]" />
                    <span>I Want This Look</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
