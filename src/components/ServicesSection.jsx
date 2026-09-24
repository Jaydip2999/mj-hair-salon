import React, { useState, useEffect } from 'react';
import { Clock, Tag, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import ServiceFinderModal from './ServiceFinderModal';

export default function ServicesSection({ onSelectService, onOpenBooking }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [finderOpen, setFinderOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [servicesRes, catRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/services/categories')
        ]);
        const servicesData = await servicesRes.json();
        const catData = await catRes.json();

        if (servicesData.success) {
          setServices(servicesData.data);
        }
        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="services" className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
              Signature Menu
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614]">
              Services & Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base text-[#5C5247] mt-3">
              Every service is delivered with professional products, personalized consultation, and verified service durations.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setFinderOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#9B7855] bg-[#F2EDE5] hover:bg-[#191614] hover:text-white border border-[#DDD3C7] hover:border-[#191614] rounded-full transition-colors cursor-pointer min-h-[44px] shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#9B7855]" />
              <span>Not sure what you need? Try Service Finder</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar" id="service-categories">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#191614] text-white shadow-xs'
                  : 'bg-[#F2EDE5] text-[#4A423A] hover:bg-[#E8E0D5] border border-[#DDD3C7]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#7D7166]">
            <div className="inline-block w-8 h-8 border-2 border-[#9B7855] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading verified services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5DDD2] hover:border-[#9B7855] transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image Header */}
                  {service.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-[#F2EDE5]">
                      <img
                        src={service.image}
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 text-xs font-bold bg-[#191614]/90 backdrop-blur-xs text-white rounded-md shadow-xs">
                          {service.price}
                        </span>
                      </div>
                      {service.popular && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-[#9B7855] text-white rounded-md shadow-xs">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#7D7166]">
                      <span className="uppercase tracking-wider font-semibold text-[#9B7855]">
                        {service.category}
                      </span>
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#8F7E70]" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold font-serif-display text-[#191614] mb-2.5">
                      {service.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#5C5247] leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 pb-6 pt-2 border-t border-[#F2EDE5] flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#191614]">
                    {service.price}
                  </div>

                  <button
                    id={`book-service-${service.id}`}
                    onClick={() => {
                      if (onSelectService) onSelectService(service);
                      if (onOpenBooking) onOpenBooking(service);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-lg transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Select & Book</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Smart Service Finder Guided Flow Modal */}
        <ServiceFinderModal
          isOpen={finderOpen}
          onClose={() => setFinderOpen(false)}
          onSelectAndBook={(service) => {
            if (onSelectService) onSelectService(service);
            if (onOpenBooking) onOpenBooking(service);
          }}
          onSelectAndView={(service) => {
            setActiveCategory(service.category);
            setTimeout(() => {
              const el = document.getElementById(`book-service-${service.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        />

      </div>
    </section>
  );
}
