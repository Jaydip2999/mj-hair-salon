import React from "react";

export interface StylistInfo {
  id: string;
  name: string;
  title: string;
  experience: string;
  specialty: string;
  avatar: string;
}

export const STYLISTS: StylistInfo[] = [
  {
    id: "any",
    name: "First Available Stylist",
    title: "Fastest Scheduling",
    experience: "Certified Team",
    specialty: "All Salon Services",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "sophia",
    name: "Sophia Laurent",
    title: "Creative Director",
    experience: "10+ Years",
    specialty: "Balayage & Hair Architecture",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "liam",
    name: "Liam Montgomery",
    title: "Master Barber & Stylist",
    experience: "8 Years",
    specialty: "Precision Fades & Men's Grooming",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "chloe",
    name: "Chloe Chen",
    title: "Senior Colorist",
    experience: "6 Years",
    specialty: "Vivid Tones & Scalp Care",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
];

interface StylistPickerProps {
  selectedStylistId?: string;
  onSelect: (stylist: StylistInfo) => void;
}

export function StylistPicker({ selectedStylistId = "any", onSelect }: StylistPickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
        Select Stylist
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLISTS.map((stylist) => {
          const isSelected = selectedStylistId === stylist.id;
          return (
            <div
              key={stylist.id}
              onClick={() => onSelect(stylist)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                isSelected
                  ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <img
                src={stylist.avatar}
                alt={stylist.name}
                className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="font-semibold text-sm text-zinc-900 block truncate">
                  {stylist.name}
                </span>
                <span className="text-xs text-amber-700 font-medium block">
                  {stylist.title} &bull; {stylist.experience}
                </span>
                <span className="text-[11px] text-zinc-500 block truncate">
                  {stylist.specialty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
