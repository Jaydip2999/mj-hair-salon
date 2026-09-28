import React from "react";

interface BookingConfirmationProps {
  booking: {
    id: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    servicePrice: number;
    stylistName: string;
    date: string;
    time: string;
  };
  onClose: () => void;
}

export function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Success badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
          &#10003;
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-serif font-bold text-2xl text-zinc-900">
            Appointment Confirmed!
          </h3>
          <p className="text-xs text-zinc-500">
            Booking Reference: <span className="font-mono font-semibold text-zinc-800">{booking.id}</span>
          </p>
        </div>

        {/* Receipt card */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">Guest:</span>
            <span className="font-semibold text-zinc-900">{booking.customerName} ({booking.customerPhone})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">Service:</span>
            <span className="font-semibold text-zinc-900">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">Stylist:</span>
            <span className="font-semibold text-zinc-900">{booking.stylistName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200/60">
            <span className="text-zinc-500">Date &amp; Time:</span>
            <span className="font-semibold text-zinc-900">{booking.date} at {booking.time}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold text-zinc-900">
            <span>Estimated Total:</span>
            <span>${booking.servicePrice}</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
          A confirmation SMS has been queued for {booking.customerPhone}. Free cancellation up to 24h prior.
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
