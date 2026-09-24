import React, { useState } from 'react';
import {
  X, Search, Calendar, Clock, Scissors, User, AlertCircle,
  CheckCircle2, XCircle, Clock4, MessageCircle, ArrowRight, Loader2
} from 'lucide-react';

export default function AppointmentLookupModal({ isOpen, onClose, salonInfo, onBookNew }) {
  const [appointmentId, setAppointmentId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);

  // Cancellation request state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e?.preventDefault();
    setError('');
    setCancelSuccess('');
    if (!appointmentId.trim() || !phone.trim()) {
      setError('Please provide both your Appointment ID (e.g. MJ-9589) and phone number.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/appointments/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setAppointment(data.data);
      } else {
        setError(data.error || 'No matching appointment found. Please verify your details.');
        setAppointment(null);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setCancelLoading(true);
      setError('');
      const res = await fetch('/api/appointments/cancel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          phone: phone.trim(),
          reason: cancelReason.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setCancelSuccess(data.message);
        setAppointment({
          ...appointment,
          status: 'CANCELLED'
        });
        setShowCancelConfirm(false);
      } else {
        setError(data.error || 'Could not cancel appointment.');
      }
    } catch (err) {
      console.error('Cancel request error:', err);
      setError('Failed to cancel appointment. Please contact Malvin directly.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock4 className="w-3.5 h-3.5 text-amber-600" />
            PENDING SALON REVIEW
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-700">
            <XCircle className="w-3.5 h-3.5 text-neutral-500" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] text-[#191614] rounded-2xl shadow-2xl border border-[#9B7855]/20 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#191614] text-[#FAF8F5] flex items-center justify-between border-b border-[#9B7855]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9B7855]/20 border border-[#9B7855]/40 flex items-center justify-center text-[#C9A96E]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#FAF8F5]">Find My Booking</h3>
              <p className="text-xs text-[#FAF8F5]/60">Lookup & manage your MJ Hair Salon reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF8F5]/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {cancelSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{cancelSuccess}</span>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleLookup} className="space-y-3 bg-white p-4 rounded-xl border border-[#9B7855]/20 shadow-sm">
            <div>
              <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                Appointment ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MJ-9589"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/30 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191614]/80 mb-1">
                Phone Number (used when booking)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 512-555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#9B7855]/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#191614] hover:bg-[#9B7855] text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Appointment</span>
                </>
              )}
            </button>
          </form>

          {/* Appointment Result Card */}
          {appointment && (
            <div className="bg-white rounded-xl border border-[#9B7855]/30 p-5 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#9B7855]/15 pb-3">
                <div>
                  <span className="text-[11px] text-[#191614]/60 font-mono">ID: {appointment.id}</span>
                  <h4 className="font-serif text-base font-medium text-[#191614]">{appointment.service}</h4>
                </div>
                <div>{getStatusBadge(appointment.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9B7855]" />
                  <div>
                    <span className="text-[#191614]/60 block text-[10px]">Date</span>
                    <span className="font-medium text-[#191614]">{appointment.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#9B7855]" />
                  <div>
                    <span className="text-[#191614]/60 block text-[10px]">Time</span>
                    <span className="font-medium text-[#191614]">{appointment.startTime} – {appointment.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#9B7855]" />
                  <div>
                    <span className="text-[#191614]/60 block text-[10px]">Duration & Price</span>
                    <span className="font-medium text-[#191614]">{appointment.duration} • {appointment.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#9B7855]" />
                  <div>
                    <span className="text-[#191614]/60 block text-[10px]">Stylist</span>
                    <span className="font-medium text-[#191614]">{appointment.stylist}</span>
                  </div>
                </div>
              </div>

              {appointment.customerNotes && (
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/15 text-xs">
                  <span className="text-[#191614]/60 block text-[10px] mb-0.5">Your Notes:</span>
                  <p className="text-[#191614]/80 italic">"{appointment.customerNotes}"</p>
                </div>
              )}

              {appointment.referenceTitle && (
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#9B7855]/15 text-xs flex items-center gap-3">
                  {appointment.referenceImage && (
                    <img
                      src={appointment.referenceImage}
                      alt={appointment.referenceTitle}
                      className="w-10 h-10 rounded-lg object-cover border border-[#9B7855]/30 bg-neutral-100"
                    />
                  )}
                  <div>
                    <span className="text-[#191614]/60 block text-[10px] uppercase font-bold tracking-wider text-[#9B7855]">
                      Reference Look Attached
                    </span>
                    <span className="font-medium text-[#191614]">{appointment.referenceTitle}</span>
                  </div>
                </div>
              )}

              {/* Status helper text */}
              {appointment.status === 'PENDING' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-medium">Appointment is currently Pending Malvin's Confirmation.</p>
                  <p className="mt-1 text-amber-800/80">
                    Feel free to message Malvin on WhatsApp with your appointment ID ({appointment.id}) for instant priority confirmation.
                  </p>
                </div>
              )}

              {/* Actions: Cancel & Reschedule */}
              <div className="space-y-2 pt-1 border-t border-[#9B7855]/15">
                {appointment.canCancel && !showCancelConfirm && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex-1 py-2 px-3 border border-red-200 hover:bg-red-50 text-red-700 text-xs rounded-xl font-medium transition-colors"
                    >
                      Request Cancellation
                    </button>
                    <a
                      href={`https://wa.me/${salonInfo?.contact?.whatsappNumber || '13464468870'}?text=${encodeURIComponent(`Hello Malvin, regarding my appointment ${appointment.id} on ${appointment.date} at ${appointment.startTime}, I would like to request a reschedule.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Message on WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Confirm Cancel prompt */}
                {showCancelConfirm && (
                  <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-2.5">
                    <p className="text-xs font-medium text-red-800">
                      Are you sure you want to cancel this appointment?
                    </p>
                    <input
                      type="text"
                      placeholder="Reason for cancellation (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-red-300 text-xs focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelRequest}
                        disabled={cancelLoading}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="py-1.5 px-3 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-xs hover:bg-neutral-50"
                      >
                        Nevermind
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Book new appointment prompt */}
          {onBookNew && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNew();
                }}
                className="text-xs text-[#9B7855] hover:text-[#191614] font-medium transition-colors inline-flex items-center gap-1"
              >
                <span>Need to book a new appointment instead?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#9B7855]/15 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
