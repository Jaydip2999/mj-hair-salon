import React from "react";

interface TimeSlotPickerProps {
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

export function TimeSlotPicker({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: TimeSlotPickerProps) {
  // Generate next 5 days
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const morningSlots = ["9:00 AM", "10:15 AM", "11:30 AM"];
  const afternoonSlots = ["1:00 PM", "2:15 PM", "3:30 PM", "5:00 PM", "6:15 PM"];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Select Date
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {dates.map((d) => {
            const isSelected = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => onSelectDate(d.iso)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-amber-600 bg-amber-500 text-zinc-950 font-bold shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider opacity-80">{d.dayName}</span>
                <span className="block text-lg font-serif font-bold leading-tight">{d.dayNumber}</span>
                <span className="block text-[10px] opacity-70">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Select Appointment Time
        </h4>

        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">Morning</span>
            <div className="grid grid-cols-3 gap-2">
              {morningSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-amber-50 font-semibold"
                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-zinc-500 block mb-1.5">Afternoon &amp; Evening</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {afternoonSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-amber-50 font-semibold"
                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
