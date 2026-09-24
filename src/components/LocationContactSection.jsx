import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Instagram, Send, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';

export default function LocationContactSection({ salonInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferred_service: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name || !formData.phone) {
      setErrorMsg('Please enter your name and phone number.');
  // Scoped enhancement: Implement directly to Malvin.

      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', preferred_service: '', message: '' });
      } else {
        setErrorMsg(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#F5F0E9] border-t border-[#EAE3DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#9B7855] mb-2">
            Visit & Connect
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-[#191614]">
            Location & Salon Contact
          </h2>
          <p className="text-sm sm:text-base text-[#5C5247] mt-3">
            Conveniently located in Round Rock, TX. Reach out by phone, WhatsApp, or send an inquiry below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Salon Info, Quick Buttons & Hours */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2D8CC] shadow-2xs space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F0E9] border border-[#DDD3C7] flex items-center justify-center text-[#9B7855] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#191614] font-serif-display">
                    Salon Studio Address
                  </h3>
                  <p className="text-sm text-[#5C5247] mt-1">
                    {salonInfo?.address?.street || "2000 I-35 Frontage Rd, Suite B2"}
                  </p>
                  <p className="text-sm text-[#5C5247]">
                    {salonInfo?.address ? `${salonInfo.address.city}, ${salonInfo.address.state} ${salonInfo.address.zip}` : "Round Rock, TX 78681"}
                  </p>
                  <a
                    href={salonInfo?.address?.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((salonInfo?.address?.street || '2000 I-35 Frontage Rd, Suite B2') + ', ' + (salonInfo?.address?.city || 'Round Rock') + ', ' + (salonInfo?.address?.state || 'TX') + ' ' + (salonInfo?.address?.zip || '78681'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7855] hover:text-[#191614] mt-2 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions in Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 pt-4 border-t border-[#F2EDE5]">
                <div className="w-10 h-10 rounded-xl bg-[#F5F0E9] border border-[#DDD3C7] flex items-center justify-center text-[#9B7855] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#191614] font-serif-display">
                    Operating Hours
                  </h3>
                  <div className="text-sm text-[#5C5247] mt-1 space-y-0.5">
                    <p className="font-medium text-[#191614]">Monday – Saturday: 9:00 AM – 6:00 PM</p>
                    <p className="text-xs text-[#7D7166]">(All appointments scheduled in advance)</p>
                    <p className="text-xs text-[#7D7166]">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F2EDE5]">
                <a
                  href={`tel:${salonInfo?.contact?.phoneRaw || '+13464468870'}`}
                  className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-white bg-[#191614] hover:bg-[#9B7855] rounded-xl transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Salon</span>
                </a>

                <a
                  href={salonInfo?.contact?.whatsappUrl || "https://wa.me/13464468870"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-[#1A4D2E] bg-[#E8F3EB] hover:bg-[#D7ECD8] border border-[#C5DEC9] rounded-xl transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={salonInfo?.contact?.instagram || "https://www.instagram.com/mj_hair_salon_/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-[#5C5247] bg-[#F5F0E9] hover:bg-[#EAE3DB] border border-[#DDD3C7] rounded-xl transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#9B7855]" />
                  <span>Instagram</span>
                </a>
              </div>

            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-[#E0D7CD] shadow-2xs h-64 bg-[#EAE3DB]">
              <iframe
                title="MJ Hair Salon Round Rock TX Location Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((salonInfo?.address?.street || '2000 I-35 Frontage Rd, Suite B2') + ', ' + (salonInfo?.address?.city || 'Round Rock') + ', ' + (salonInfo?.address?.state || 'TX') + ' ' + (salonInfo?.address?.zip || '78681'))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

          {/* Right: Direct Inquiry Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-[#E2D8CC] shadow-2xs">
            <h3 className="text-2xl font-serif-display font-semibold text-[#191614] mb-2">
              Send a Salon Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5247] mb-6">
              Have questions about your hair goals, nanoplasty treatments, or color correction consultations? Submit your note directly to Malvin.
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#E8F3EB] border border-[#C5DEC9] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#2E7D32] mx-auto" />
                <h4 className="text-base font-semibold text-[#1A4D2E]">Message Received</h4>
                <p className="text-xs text-[#2E7D32] max-w-sm mx-auto">
                  Thank you for reaching out to MJ Hair Salon! Malvin will contact you at your phone number shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-[#1A4D2E] underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C5E51] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DDD3C7] focus:outline-hidden focus:border-[#9B7855] focus:ring-1 focus:ring-[#9B7855] bg-[#FAF8F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C5E51] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(512) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DDD3C7] focus:outline-hidden focus:border-[#9B7855] focus:ring-1 focus:ring-[#9B7855] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C5E51] mb-1.5">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="sarah@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DDD3C7] focus:outline-hidden focus:border-[#9B7855] focus:ring-1 focus:ring-[#9B7855] bg-[#FAF8F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C5E51] mb-1.5">
                      Service of Interest
                    </label>
                    <select
                      name="preferred_service"
                      value={formData.preferred_service}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DDD3C7] focus:outline-hidden focus:border-[#9B7855] focus:ring-1 focus:ring-[#9B7855] bg-[#FAF8F5]"
                    >
                      <option value="">Select a service category</option>
                      <option value="Balayage & Blonding">Balayage & Blonding</option>
                      <option value="Female Precision Haircut">Female Precision Haircut</option>
                      <option value="Silk Press Styling">Silk Press Styling</option>
                      <option value="Nanoplasty Restorative Treatment">Nanoplasty Restorative Treatment</option>
                      <option value="Brazilian Straightening">Brazilian Straightening</option>
                      <option value="Color Correction Consultation">Color Correction Consultation</option>
                      <option value="Other / General Question">Other / General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C5E51] mb-1.5">
                    Your Message or Hair Goal
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell us about your hair type, current color, or what you'd like to achieve..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#DDD3C7] focus:outline-hidden focus:border-[#9B7855] focus:ring-1 focus:ring-[#9B7855] bg-[#FAF8F5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#191614] hover:bg-[#9B7855] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Send Inquiry to Salon'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
