/**
 * Client-side appointment persistence store backed by localStorage.
 */

export interface StoredAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  stylistId: string;
  stylistName: string;
  date: string;
  time: string;
  notes?: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

const STORAGE_KEY = "mj_salon_appointments_v1";

export const AppointmentStore = {
  getAll(): StoredAppointment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Pre-seed sample appointments for staff preview
        const initial = this.getSeedAppointments();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return this.getSeedAppointments();
    }
  },

  create(appointment: Omit<StoredAppointment, "id" | "createdAt" | "status">): StoredAppointment {
    const appointments = this.getAll();
    const newRecord: StoredAppointment = {
      ...appointment,
      id: "MJ-" + Math.floor(10000 + Math.random() * 90000),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(newRecord);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {}
    return newRecord;
  },

  updateStatus(id: string, status: StoredAppointment["status"]): boolean {
    const appointments = this.getAll();
    const target = appointments.find((a) => a.id === id);
    if (!target) return false;
    target.status = status;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
      return true;
    } catch {
      return false;
    }
  },

  getSeedAppointments(): StoredAppointment[] {
    const today = new Date().toISOString().split("T")[0];
    return [
      {
        id: "MJ-48201",
        customerName: "Audrey Hepburn",
        customerPhone: "(555) 345-6789",
        serviceId: "svc_balayage",
        serviceName: "Artisan Balayage & Glaze",
        servicePrice: 210,
        stylistId: "sophia",
        stylistName: "Sophia Laurent",
        date: today,
        time: "10:15 AM",
        status: "Confirmed",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "MJ-48202",
        customerName: "James Dean",
        customerPhone: "(555) 789-0123",
        serviceId: "svc_cut_men",
        serviceName: "Precision Barbering & Styling",
        servicePrice: 55,
        stylistId: "liam",
        stylistName: "Liam Montgomery",
        date: today,
        time: "2:15 PM",
        status: "Confirmed",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  },
};
