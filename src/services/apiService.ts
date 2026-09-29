/**
 * Typed Salon API Service with network latency simulation & error handling.
 */

import { SERVICES, ServiceItem } from "../data/services";
import { AppointmentStore, StoredAppointment } from "./appointmentStore";

export class SalonApiService {
  /**
   * Fetches available services with simulated 200ms latency.
   */
  static async getServices(): Promise<ServiceItem[]> {
    await this.delay(200);
    return [...SERVICES];
  }

  /**
   * Checks slot availability for a given date and stylist.
   */
  static async checkAvailability(date: string, stylistId: string): Promise<string[]> {
    await this.delay(150);
    const booked = AppointmentStore.getAll()
      .filter((a) => a.date === date && a.stylistId === stylistId && a.status !== "Cancelled")
      .map((a) => a.time);

    const allSlots = ["9:00 AM", "10:15 AM", "11:30 AM", "1:00 PM", "2:15 PM", "3:30 PM", "5:00 PM"];
    return allSlots.filter((time) => !booked.includes(time));
  }

  /**
   * Submits booking request with validation and persistence.
   */
  static async submitBooking(payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    stylistId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<StoredAppointment> {
    await this.delay(350);

    const service = SERVICES.find((s) => s.id === payload.serviceId);
    if (!service) {
      throw new Error("Invalid service selection.");
    }

    const stylistNames: Record<string, string> = {
      any: "First Available Stylist",
      sophia: "Sophia Laurent",
      liam: "Liam Montgomery",
      chloe: "Chloe Chen",
    };

    const record = AppointmentStore.create({
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      stylistId: payload.stylistId,
      stylistName: stylistNames[payload.stylistId] || "Staff Stylist",
      date: payload.date,
      time: payload.time,
      notes: payload.notes,
    });

    return record;
  }

  private static delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
