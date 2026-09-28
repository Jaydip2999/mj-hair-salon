export interface ServiceItem {
  id: string;
  name: string;
  category: "Cuts" | "Color" | "Styling" | "Treatments";
  price: number;
  durationMinutes: number;
  description: string;
  popular?: boolean;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "svc_cut_women",
    name: "Master Haircut & Blowout",
    category: "Cuts",
    price: 85,
    durationMinutes: 60,
    description: "Personalized hair architecture, shampoo with botanical scalp massage, and bespoke blowout finish.",
    popular: true,
  },
  {
    id: "svc_cut_men",
    name: "Precision Barbering & Styling",
    category: "Cuts",
    price: 55,
    durationMinutes: 45,
    description: "Tailored scissor or clipper fade, hot lather neck shave, and styling product finish.",
  },
  {
    id: "svc_balayage",
    name: "Artisan Balayage & Glaze",
    category: "Color",
    price: 210,
    durationMinutes: 150,
    description: "Hand-painted sun-kissed dimension customized to skin tone, followed by gloss glaze treatment.",
    popular: true,
  },
  {
    id: "svc_single_color",
    name: "Full Single-Process Color",
    category: "Color",
    price: 120,
    durationMinutes: 90,
    description: "Seamless single tone root-to-end luxury pigment coverage with gloss conditioning finish.",
  },
  {
    id: "svc_blowout",
    name: "Signature Studio Blowout",
    category: "Styling",
    price: 50,
    durationMinutes: 45,
    description: "Volumizing wash, blowout with round-brush technique, and thermal curl or smooth finish.",
  },
  {
    id: "svc_keratin",
    name: "Restorative Keratin Treatment",
    category: "Treatments",
    price: 195,
    durationMinutes: 120,
    description: "Intense frizz control, protein reconstruction, and long-lasting glass-like gloss finish.",
  },
];
