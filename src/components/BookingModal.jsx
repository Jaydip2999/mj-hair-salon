import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft,
  ArrowRight, Phone, MessageCircle, AlertCircle, Sparkles, Loader2,
  CalendarCheck, Scissors, RefreshCw, ExternalLink
} from 'lucide-react';

export default function BookingModal({ isOpen, onClose, preselectedService, referenceLook, salonInfo, onOpenLookup }) {
  // Steps:
  // 1: Service
  // 2: Date
  // 3: Time Slot
  // 4: Customer Details
  // 5: Booking Summary
  // 6: Booking Confirmation
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Load services and categories
  useEffect(() => {
    async function loadServicesData() {
      try {
        const [servRes, catRes] = await Promise.all([
          fetch('/api/services?onlineOnly=true'),
          fetch('/api/services/categories')
        ]);
        const servData = await servRes.json();
        const catData = await catRes.json();

        if (servData.success) {
          setServices(servData.data);
          if (preselectedService) {
            const found = servData.data.find(
              s => s.id === preselectedService.id || s.name.toLowerCase() === preselectedService.name?.toLowerCase()
            );
            if (found) {
              setSelectedService(found);
            } else {
              setSelectedService(preselectedService);
            }
          }
        }
        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error('Error loading services for booking modal:', err);
      }
    }
    if (isOpen) {
      loadServicesData();
    }
  }, [isOpen, preselectedService]);

  // Update selectedService if preselectedService prop changes
  useEffect(() => {
    if (preselectedService && services.length > 0) {
      const found = services.find(
        s => s.id === preselectedService.id || s.name.toLowerCase() === preselectedService.name?.toLowerCase()
      );
      if (found) {
        setSelectedService(found);
      } else {
        setSelectedService(preselectedService);
      }
    }
  }, [preselectedService, services]);

  // Fetch available slots when Service + Date are chosen
  const fetchAvailableSlots = async (serviceId, date) => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setSlotsError('');
    setSelectedTime('');
    try {
      const res = await fetch(`/api/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (data.success) {
        if (data.isClosed) {
          setSlotsError(data.reason || 'The salon is closed on this date.');
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
          if ((data.slots || []).length === 0) {
            setSlotsError('No open time slots remaining for this date. Please pick another date.');
          }
        }
      } else {
        setSlotsError(data.error || 'Unable to retrieve available slots.');
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setSlotsError('Error connecting to the scheduling system. Please try again.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedService && selectedDate && step === 3) {
      fetchAvailableSlots(selectedService.id, selectedDate);
    }
  }, [selectedService, selectedDate, step]);

  if (!isOpen) return null;

  // Next Step validation and progression
  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!selectedService) {
        setErrorMessage('Please choose a service to continue.');
  // Scoped enhancement: Implement on notice */}
  // Scoped enhancement: Implement on notice */}
  // Scoped enhancement: Implement on notice */}



        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedDate) {
        setErrorMessage('Please select a date for your appointment.');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!selectedTime) {
        setErrorMessage('Please select an available start time.');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!customerDetails.name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!customerDetails.phone.trim() || customerDetails.phone.replace(/\D/g, '').length < 7) {
        setErrorMessage('Please enter a valid phone number for appointment updates.');
        return;
      }
      setStep(5);
      return;
    }

    if (step === 5) {
      handleSubmitBooking();
      return;
    }
  };

  // Submit Booking to Backend
  const handleSubmitBooking = async () => {
    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedTime,
          customerName: customerDetails.name.trim(),
          customerPhone: customerDetails.phone.trim(),
          customerEmail: customerDetails.email.trim(),
          customerNotes: customerDetails.notes.trim(),
          referenceImage: referenceLook?.image || null,
          referenceTitle: referenceLook?.title || null
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Double-booking conflict occurred!
        setErrorMessage(data.error || 'This time slot is no longer available. Please choose another time.');
        // Return to time step and refresh available slots
        setStep(3);
        fetchAvailableSlots(selectedService.id, selectedDate);
        return;
      }

      if (data.success) {
        setBookingConfirmation(data.data);
        setStep(6);
      } else {
        setErrorMessage(data.error || 'We could not complete your booking. Please review your details.');
      }
    } catch (err) {
      console.error('Submit booking error:', err);
      setErrorMessage('A network error occurred. Please try again or book directly via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset modal state on close
  const handleClose = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setCustomerDetails({ name: '', phone: '', email: '', notes: '' });
    setBookingConfirmation(null);
    setErrorMessage('');
    onClose();
  };

  // Date generation for upcoming days (up to 30 days)
  const today = new Date();
  const dateOptions = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const isSunday = d.getDay() === 0;

    dateOptions.push({
      dateStr,
      dayName,
      monthName,
      dayNum,
      isSunday,
      isToday: i === 0
    });
  }

  // Filter services by category
  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  // Format 24h to 12h time
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#191614] rounded-2xl shadow-2xl border border-[#9B7855]/20 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#191614] text-[#FAF8F5] flex items-center justify-between border-b border-[#9B7855]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9B7855]/20 border border-[#9B7855]/40 flex items-center justify-center text-[#C9A96E]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">
                {step === 6 ? 'Appointment Requested' : 'Book an Appointment'}
              </h3>
              <p className="text-xs text-[#FAF8F5]/60">
                MJ Hair Salon • Malvin Soto • Round Rock, TX
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF8F5]/70 hover:text-white transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar (Steps 1 to 5) */}
        {step < 6 && (
          <div className="px-6 pt-4 pb-2 border-b border-[#9B7855]/10 bg-white/60">
            <div className="flex items-center justify-between text-xs font-medium text-[#191614]/60 mb-2">
              <span className={step >= 1 ? 'text-[#9B7855] font-semibold' : ''}>1. Service</span>
              <span>→</span>
              <span className={step >= 2 ? 'text-[#9B7855] font-semibold' : ''}>2. Date</span>
              <span>→</span>
              <span className={step >= 3 ? 'text-[#9B7855] font-semibold' : ''}>3. Time</span>
              <span>→</span>
              <span className={step >= 4 ? 'text-[#9B7855] font-semibold' : ''}>4. Details</span>
              <span>→</span>
              <span className={step >= 5 ? 'text-[#9B7855] font-semibold' : ''}>5. Summary</span>
            </div>
            <div className="w-full bg-[#9B7855]/15 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#9B7855] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-medium">{errorMessage}</p>
                {step === 3 && (
                  <p className="text-xs text-red-600/80 mt-1">
                    Available times have been refreshed. Please select another slot below.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              {referenceLook && (
                <div className="p-3 bg-[#FAF8F5] border border-[#9B7855]/30 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#9B7855]/40 bg-neutral-200">
                    <img src={referenceLook.image} alt={referenceLook.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9B7855]">Reference Look Attached</span>
                    <h5 className="text-xs font-semibold text-[#191614] truncate">{referenceLook.title}</h5>
                    <p className="text-[11px] text-[#5C5247]">Select your desired hair service below. Malvin will reference your photo.</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-base font-serif font-medium text-[#191614]">Select a Hair Service</h4>
                <p className="text-xs text-[#191614]/70 mt-0.5">
                  Choose from Malvin's signature haircuts, lived-in blonding, silk press, or smoothing treatments.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#191614] text-[#FAF8F5] font-medium'
                        : 'bg-white border border-[#9B7855]/25 text-[#191614]/70 hover:bg-[#9B7855]/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Service Cards */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredServices.map(service => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#9B7855] bg-[#9B7855]/10 shadow-sm ring-1 ring-[#9B7855]'
                          : 'border-[#9B7855]/20 bg-white hover:border-[#9B7855]/50 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/assets/real/mj_logo_square.jpeg'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm text-[#191614] truncate">{service.name}</h5>
                            {service.popular && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#9B7855]/15 text-[#9B7855] font-semibold uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#191614]/65 line-clamp-1 mt-0.5">{service.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[#191614]/70">
                            <span className="flex items-center gap-1 font-mono text-[#9B7855]">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-[#191614]">{service.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-[#9B7855] bg-[#9B7855] text-white' : 'border-[#9B7855]/40'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-serif font-medium text-[#191614]">Select Appointment Date</h4>
                <p className="text-xs text-[#191614]/70 mt-0.5">
                  MJ Hair Salon operates Monday through Saturday. Sundays are reserved for rest.
                </p>
              </div>

              {selectedService && (
                <div className="p-3 bg-white rounded-xl border border-[#9B7855]/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#191614]/60">Selected: </span>
                    <span className="font-medium text-[#191614]">{selectedService.name}</span>
                  </div>
                  <span className="font-mono text-[#9B7855] font-medium">{selectedService.duration} ({selectedService.price})</span>
                </div>
              )}

              {/* Day selection grid */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {dateOptions.map(opt => {
                  const isSelected = selectedDate === opt.dateStr;
                  const isDisabled = opt.isSunday;

                  return (
                    <button
                      key={opt.dateStr}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedDate(opt.dateStr)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isDisabled
                          ? 'bg-neutral-100 border-neutral-200 opacity-45 cursor-not-allowed text-neutral-400'
                          : isSelected
                          ? 'border-[#9B7855] bg-[#9B7855] text-white shadow-md'
                          : 'bg-white border-[#9B7855]/20 hover:border-[#9B7855] text-[#191614]'
                      }`}
                    >
                      <span className={`text-[11px] font-medium uppercase ${isSelected ? 'text-white/80' : 'text-[#191614]/60'}`}>
                        {opt.dayName}
                      </span>
                      <span className={`text-lg font-bold font-mono my-0.5 ${isSelected ? 'text-white' : 'text-[#191614]'}`}>
                        {opt.dayNum}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#191614]/50'}`}>
                        {isDisabled ? 'Closed' : opt.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick note on notice */}
              <div className="p-3 bg-[#9B7855]/10 rounded-xl border border-[#9B7855]/20 text-xs text-[#191614]/80 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9B7855] flex-shrink-0" />
                <span>Notice: Online bookings require at least 2 hours advance notice. Same-day walk-in inquiries can be verified via WhatsApp.</span>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT TIME SLOT */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif font-medium text-[#191614]">Choose an Available Time Slot</h4>
                  <p className="text-xs text-[#191614]/70 mt-0.5">
                    Live slots generated for {selectedService?.name} ({selectedService?.duration}) on {selectedDate}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchAvailableSlots(selectedService?.id, selectedDate)}
                  disabled={loadingSlots}
                  className="p-1.5 text-xs text-[#9B7855] hover:bg-[#9B7855]/10 rounded-lg flex items-center gap-1 border border-[#9B7855]/30 transition-colors"
                  title="Refresh slots"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSlots ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Service & Date badge */}
              <div className="p-3 bg-white rounded-xl border border-[#9B7855]/20 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9B7855]" />
                  <span className="font-medium text-[#191614]">{selectedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#9B7855]" />
                  <span className="font-medium text-[#191614]">{selectedService?.name}</span>
                  <span className="text-[#9B7855] font-mono">({selectedService?.duration})</span>
                </div>
              </div>

              {/* Slots display */}
              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#191614]/70">
                  <Loader2 className="w-6 h-6 animate-spin text-[#9B7855]" />
                  <p className="text-sm font-medium">Checking live salon schedule & breaks...</p>
                </div>
              ) : slotsError ? (
                <div className="py-8 text-center space-y-3 bg-white rounded-xl border border-dashed border-[#9B7855]/30 p-6">
                  <p className="text-sm text-[#191614]/80">{slotsError}</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-[#191614] text-white rounded-xl text-xs font-medium hover:bg-[#9B7855] transition-colors"
                  >
                    Choose a Different Date
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableSlots.map(slot => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-3 rounded-xl border text-sm font-mono font-medium transition-all ${
                            isSelected
                              ? 'bg-[#9B7855] text-white border-[#9B7855] shadow-md ring-2 ring-[#9B7855]/30'
                              : 'bg-white text-[#191614] border-[#9B7855]/20 hover:border-[#9B7855] hover:bg-[#9B7855]/10'
                          }`}
                        >
                          {formatTimeDisplay(slot)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#191614]/60 text-center">
                    All times are in Central Time (America/Chicago). Malvin Soto personally attends to each appointment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS (GUEST BOOKING) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-serif font-medium text-[#191614]">Client Details</h4>
                <p className="text-xs text-[#191614]/70 mt-0.5">
                  Book as a guest in seconds. No password or account setup required.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Vance"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (512) 555-0199"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                  />
                  <span className="text-[10px] text-[#191614]/60 mt-0.5 block">
                    Used for your booking confirmation & easy status lookup.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                    Email Address <span className="text-[#191614]/50 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. elena@example.com"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                    Hair Goals or Notes <span className="text-[#191614]/50 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell Malvin about your hair texture, previous color treatments, or desired look..."
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#9B7855]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING SUMMARY */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-serif font-medium text-[#191614]">Review Booking Summary</h4>
                <p className="text-xs text-[#191614]/70 mt-0.5">
                  Please confirm your reservation details before submitting.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#9B7855]/25 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#9B7855]/15 pb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedService?.image}
                      alt={selectedService?.name}
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-200"
                    />
                    <div>
                      <h5 className="font-medium text-sm text-[#191614]">{selectedService?.name}</h5>
                      <p className="text-xs text-[#191614]/60">{selectedService?.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-base text-[#9B7855]">{selectedService?.price}</span>
                    <p className="text-xs text-[#191614]/60 font-mono">{selectedService?.duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#191614]/60 block mb-0.5">Date</span>
                    <span className="font-medium text-[#191614]">{selectedDate}</span>
                  </div>
                  <div>
                    <span className="text-[#191614]/60 block mb-0.5">Time</span>
                    <span className="font-medium text-[#191614]">{formatTimeDisplay(selectedTime)}</span>
                  </div>
                  <div>
                    <span className="text-[#191614]/60 block mb-0.5">Stylist</span>
                    <span className="font-medium text-[#191614]">Malvin Soto (Master Stylist)</span>
                  </div>
                  <div>
                    <span className="text-[#191614]/60 block mb-0.5">Initial Status</span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      PENDING REVIEW
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#9B7855]/15 pt-2.5 text-xs">
                  <span className="text-[#191614]/60 block mb-0.5">Client</span>
                  <p className="font-medium text-[#191614]">{customerDetails.name} • {customerDetails.phone}</p>
                  {customerDetails.email && <p className="text-[#191614]/70">{customerDetails.email}</p>}
                  {customerDetails.notes && (
                    <p className="text-[#191614]/70 italic mt-1 bg-[#FAF8F5] p-2 rounded-lg border border-[#9B7855]/15">
                      "{customerDetails.notes}"
                    </p>
                  )}
                </div>

                {referenceLook && (
                  <div className="border-t border-[#9B7855]/15 pt-2.5 text-xs flex items-center gap-3">
                    <img
                      src={referenceLook.image}
                      alt={referenceLook.title}
                      className="w-10 h-10 rounded-lg object-cover border border-[#9B7855]/30 bg-neutral-100"
                    />
                    <div className="min-w-0">
                      <span className="text-[#191614]/60 block text-[10px] uppercase font-bold tracking-wider text-[#9B7855]">
                        Reference Look
                      </span>
                      <span className="font-medium text-[#191614] truncate block">{referenceLook.title}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellation Policy Notice */}
              <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs text-[#191614]/70">
                <span className="font-medium text-[#191614] block mb-0.5">Salon Policy:</span>
                Please provide at least 24 hours notice for any changes or cancellations. Malvin Soto reserves this dedicated time exclusively for your service.
              </div>
            </div>
          )}

          {/* STEP 6: BOOKING CONFIRMATION */}
          {step === 6 && bookingConfirmation && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 bg-amber-100 border border-amber-300 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider mb-2">
                  Status: PENDING REVIEW
                </span>
                <h4 className="text-xl font-serif font-medium text-[#191614]">
                  Appointment Request Received!
                </h4>
                <p className="text-xs text-[#191614]/70 max-w-md mx-auto mt-1.5">
                  Your reservation request has been submitted to Malvin Soto. Because MJ Hair Salon provides bespoke 1-on-1 private styling, your booking is placed in <strong className="text-[#191614]">PENDING</strong> status until Malvin reviews and confirms it.
                </p>
              </div>

              {/* Details card with Appointment ID */}
              <div className="bg-white rounded-xl border border-[#9B7855]/30 p-4 text-left max-w-md mx-auto shadow-sm space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#9B7855]/15 pb-2">
                  <span className="text-[#191614]/60">Appointment ID:</span>
                  <span className="font-mono font-bold text-sm text-[#9B7855]">{bookingConfirmation.appointmentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#191614]/60">Client:</span>
                  <span className="font-medium text-[#191614]">{bookingConfirmation.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#191614]/60">Service:</span>
                  <span className="font-medium text-[#191614]">{bookingConfirmation.service?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#191614]/60">Date & Time:</span>
                  <span className="font-medium text-[#191614]">
                    {bookingConfirmation.date} at {formatTimeDisplay(bookingConfirmation.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#191614]/60">Estimated Price:</span>
                  <span className="font-medium text-[#191614]">{bookingConfirmation.service?.price}</span>
                </div>
                {bookingConfirmation.referenceTitle && (
                  <div className="flex items-center justify-between border-t border-[#9B7855]/15 pt-2">
                    <span className="text-[#191614]/60">Reference Look:</span>
                    <span className="font-medium text-[#191614]">{bookingConfirmation.referenceTitle}</span>
                  </div>
                )}
              </div>

              {/* Instant WhatsApp Action */}
              <div className="max-w-md mx-auto space-y-2">
                <a
                  href={bookingConfirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Booking Details to Malvin on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                {onOpenLookup && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onOpenLookup();
                    }}
                    className="w-full py-2.5 px-4 bg-white border border-[#9B7855]/30 text-[#191614] hover:bg-[#9B7855]/10 text-xs rounded-xl font-medium transition-colors"
                  >
                    Check or Manage Booking Anytime
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-[#9B7855]/15 flex items-center justify-between">
          {step > 1 && step < 6 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setStep(prev => prev - 1);
              }}
              className="px-4 py-2 border border-[#9B7855]/30 rounded-xl text-xs font-medium text-[#191614] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="px-5 py-2.5 bg-[#191614] text-[#FAF8F5] hover:bg-[#9B7855] rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : step === 5 ? (
                <>
                  <span>Submit Appointment Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 bg-[#191614] text-[#FAF8F5] hover:bg-[#9B7855] rounded-xl text-xs font-medium transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
