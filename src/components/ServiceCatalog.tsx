import React, { useState } from "react";
import { SERVICES, ServiceItem } from "../data/services";

interface ServiceCatalogProps {
  onSelectService?: (service: ServiceItem) => void;
  selectedServiceId?: string;
}

export function ServiceCatalog({ onSelectService, selectedServiceId }: ServiceCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Cuts", "Color", "Styling", "Treatments"];

  const filteredServices = SERVICES.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="services" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
              Curated Menu
            </span>
            <h2 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">
              Salon Services &amp; Pricing
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              All services include consultation, botanical wash, and personalized finish.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <div
                key={service.id}
                className={`p-6 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-bold text-lg text-zinc-900 leading-snug">
                      {service.name}
                    </h3>
                    <span className="text-lg font-bold text-zinc-900 font-serif">
                      ${service.price}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                    {service.durationMinutes} mins
                  </span>
                  <button
                    onClick={() => onSelectService && onSelectService(service)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-amber-600 text-white"
                        : "bg-zinc-900 hover:bg-zinc-800 text-white"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Service"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No services match "{searchQuery}". Try selecting another category.
          </div>
        )}
      </div>
    </section>
  );
}
