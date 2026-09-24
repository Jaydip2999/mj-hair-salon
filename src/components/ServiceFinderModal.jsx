import React, { useState, useEffect } from 'react';
import { X, Sparkles, Scissors, Palette, Sparkle, Wind, ArrowRight, Check, RotateCcw, Clock, Calendar } from 'lucide-react';

export default function ServiceFinderModal({ isOpen, onClose, onSelectAndBook, onSelectAndView }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setStep(1);
      setSelectedPrimary(null);
      setSelectedGoal(null);

      // Load services
      async function fetchServices() {
        try {
          setLoading(true);
          const res = await fetch('/api/services?onlineOnly=true');
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setServices(data.data);
          }
        } catch (err) {
          console.error('Failed to load services for finder:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchServices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const primaryOptions = [
    {
      id: 'haircut',
      label: 'Haircut & Shaping',
      category: 'Haircuts & Styling',
      icon: Scissors,
      desc: 'Precision cuts, bob shaping, layers, and grooming'
    },
    {
      id: 'color',
      label: 'Hair Color & Blonding',
      category: 'Color & Blonding',
      icon: Palette,
      desc: 'Balayage, foil highlights, lived-in blonding, and gloss'
    },
    {
      id: 'treatment',
      label: 'Hair Treatment',
      category: 'Treatments',
      icon: Sparkle,
      desc: 'Bond repair, intense hydration, and restorative care'
    },
    {
      id: 'styling',
      label: 'Silk Press & Styling',
      category: 'Haircuts & Styling',
      icon: Wind,
      desc: 'Thermal smoothing silk press and signature blowouts'
    }
  ];

  const goalOptionsByPrimary = {
    haircut: [
      { id: 'short', label: 'Short Hair / Bob / Pixie', keywords: ['bob', 'haircut', 'short'] },
      { id: 'layers', label: 'Medium to Long Hair & Layers', keywords: ['haircut', 'blowdry', 'long', 'style'] },
      { id: 'mens', label: "Men's Classic Cut & Beard", keywords: ['men', 'beard', 'cut'] }
    ],
    color: [
      { id: 'balayage', label: 'Dimensional Balayage / Lived-In Blonding', keywords: ['balayage', 'blonde', 'dimensional'] },
      { id: 'highlights', label: 'Full or Partial Foil Highlights', keywords: ['highlights', 'foil', 'partial'] },
      { id: 'touchup', label: 'Single Process / Root Touch-Up / Toner', keywords: ['single', 'root', 'toner', 'color', 'gloss'] }
    ],
    treatment: [
      { id: 'moisture', label: 'Deep Conditioning & Moisture Repair', keywords: ['deep conditioning', 'treatment', 'moisture'] },
      { id: 'restorative', label: 'Scalp & Structural Hair Therapy', keywords: ['treatment', 'repair', 'conditioning'] }
    ],
    styling: [
      { id: 'silkpress', label: 'Silk Press & Thermal Smoothing', keywords: ['silk press', 'smoothing', 'thermal'] },
      { id: 'blowout', label: 'Shampoo & Signature Blowout', keywords: ['blowout', 'shampoo', 'style'] }
    ]
  };

  const handleSelectPrimary = (option) => {
    setSelectedPrimary(option);
    setSelectedGoal(null);
    setStep(2);
  };

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
    setStep(3);
  };

  // Find matching services from actual database
  const getRecommendedServices = () => {
    if (!selectedPrimary || services.length === 0) return [];

    let filtered = services.filter(s => {
      // Primary category check
      const catMatch = s.category.toLowerCase().includes(selectedPrimary.category.toLowerCase()) ||
                       selectedPrimary.category.toLowerCase().includes(s.category.toLowerCase());
      return catMatch;
    });

    if (selectedGoal && selectedGoal.keywords) {
      const keywordMatches = filtered.filter(s => {
        const text = `${s.name} ${s.description}`.toLowerCase();
        return selectedGoal.keywords.some(kw => text.includes(kw.toLowerCase()));
      });
      if (keywordMatches.length > 0) {
        return keywordMatches;
      }
    }

    return filtered.length > 0 ? filtered : services.slice(0, 3);
  };

  const recommendedServices = getRecommendedServices();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#FAF8F5] text-[#191614] rounded-2xl shadow-2xl border border-[#9B7855]/30 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#191614] text-[#FAF8F5] flex items-center justify-between border-b border-[#9B7855]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#9B7855]/20 border border-[#9B7855]/40 flex items-center justify-center text-[#C9A96E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-white">Smart Service Finder</h3>
              <p className="text-[11px] text-[#FAF8F5]/70">Find the ideal salon service for your hair in two taps</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Finder"
            className="p-1.5 rounded-lg text-[#FAF8F5]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-3 pb-2 bg-white/70 border-b border-[#9B7855]/15 flex items-center justify-between text-xs text-[#191614]/70">
          <span className={step >= 1 ? 'font-semibold text-[#9B7855]' : ''}>1. Category</span>
          <span>→</span>
          <span className={step >= 2 ? 'font-semibold text-[#9B7855]' : ''}>2. Hair Goal</span>
          <span>→</span>
          <span className={step >= 3 ? 'font-semibold text-[#9B7855]' : ''}>3. Recommendations</span>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh]">
          {/* STEP 1: PRIMARY CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-5">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#9B7855]">Step 1 of 2</p>
                <h4 className="text-xl sm:text-2xl font-serif font-medium text-[#191614] mt-1">
                  What are you looking for?
                </h4>
                <p className="text-xs sm:text-sm text-[#5C5247] mt-1">
                  Select your primary service interest to view matching options from our verified menu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primaryOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectPrimary(opt)}
                      className="p-4 rounded-xl border border-[#E5DDD2] bg-white hover:border-[#9B7855] hover:bg-[#F5F0E9]/50 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs hover:shadow-xs min-h-[56px]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#DDD3C7] flex items-center justify-center text-[#9B7855] group-hover:bg-[#191614] group-hover:text-white transition-colors flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-[#191614] group-hover:text-[#9B7855] transition-colors">
                          {opt.label}
                        </h5>
                        <p className="text-xs text-[#6C5E51] mt-0.5 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: HAIR GOAL */}
          {step === 2 && selectedPrimary && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#9B7855] hover:underline mb-1 inline-flex items-center gap-1 font-medium"
                >
                  ← Back to categories
                </button>
                <h4 className="text-xl sm:text-2xl font-serif font-medium text-[#191614]">
                  What best describes your goal?
                </h4>
                <p className="text-xs sm:text-sm text-[#5C5247] mt-1">
                  Narrowing down helps us show the most accurate service from Malvin's menu.
                </p>
              </div>

              <div className="space-y-2.5">
                {(goalOptionsByPrimary[selectedPrimary.id] || []).map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleSelectGoal(goal)}
                    className="w-full p-4 rounded-xl border border-[#E5DDD2] bg-white hover:border-[#9B7855] hover:bg-[#F5F0E9]/50 transition-all text-left flex items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-xs min-h-[52px]"
                  >
                    <span className="text-sm font-medium text-[#191614]">{goal.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#9B7855]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: RECOMMENDATIONS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#9B7855]">Personalized Results</p>
                <h4 className="text-xl sm:text-2xl font-serif font-medium text-[#191614] mt-1">
                  These services may be suitable based on your selection.
                </h4>
                <p className="text-xs text-[#5C5247] mt-1">
                  Every service begins with a personal consultation with Malvin Soto to tailor the technique to your hair.
                </p>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-[#7D7166]">
                  Loading matching services...
                </div>
              ) : recommendedServices.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#7D7166]">
                  No exact matches found. Please explore our full menu.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-xl border border-[#E5DDD2] bg-white shadow-2xs hover:border-[#9B7855] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {service.image && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#F2EDE5] border border-[#DDD3C7]">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/assets/real/mj_logo_square.jpeg'; }}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#9B7855]">
                            {service.category}
                          </span>
                          <h5 className="text-base font-semibold font-serif text-[#191614] leading-snug">
                            {service.name}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-[#5C5247] mt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-[#9B7855]" />
                              {service.duration}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[#191614]">{service.price}</span>
                          </div>
                          <p className="text-xs text-[#6C5E51] line-clamp-2 mt-1.5 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2EDE5]">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onSelectAndBook) {
                              onSelectAndBook(service);
                            }
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-[#191614] hover:bg-[#9B7855] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Appointment</span>
                        </button>
                        {onSelectAndView && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectAndView(service);
                            }}
                            className="flex-1 sm:flex-none px-3 py-2 bg-[#F2EDE5] hover:bg-[#EAE3DB] text-[#191614] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 min-h-[44px] cursor-pointer border border-[#DDD3C7]"
                          >
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Reset Action */}
              <div className="pt-4 border-t border-[#E5DDD2] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#9B7855] hover:underline flex items-center gap-1 font-medium py-2 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#6C5E51] hover:text-[#191614] font-medium py-2 px-3 min-h-[44px]"
                >
                  Close Finder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
