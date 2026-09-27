// @ts-nocheck
/**
 * Automated unit test suite for appointment validation rules.
 */
import { validatePhone, validateName, validateDate, validateBookingForm } from "../utils/validation.ts";

describe("Booking Form Validation", () => {
  describe("validateName", () => {
    it("should accept valid customer names", () => {
      expect(validateName("Jane Doe").isValid).toBe(true);
      expect(validateName("Alexander").isValid).toBe(true);
    });

    it("should reject empty names", () => {
      const res = validateName("");
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("should reject single-character names", () => {
      const res = validateName("J");
      expect(res.isValid).toBe(false);
    });
  });

  describe("validatePhone", () => {
    it("should format valid 10-digit phone numbers", () => {
      const res = validatePhone("5550199123");
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe("(555) 019-9123");
    });

    it("should reject incomplete phone numbers", () => {
      const res = validatePhone("12345");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("10-digit");
    });

    it("should reject empty phone input", () => {
      const res = validatePhone("");
      expect(res.isValid).toBe(false);
    });
  });

  describe("validateDate", () => {
    it("should reject dates in the past", () => {
      const pastDate = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0];
      const res = validateDate(pastDate);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("past");
    });

    it("should accept valid future dates", () => {
      const futureDate = new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
      const res = validateDate(futureDate);
      expect(res.isValid).toBe(true);
    });
  });

  describe("validateBookingForm", () => {
    it("should return isValid=true when all fields are valid", () => {
      const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
      const res = validateBookingForm({
        name: "Sarah Connor",
        phone: "5551234567",
        date: futureDate,
        service: "1",
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });

    it("should aggregate errors when multiple fields are invalid", () => {
      const res = validateBookingForm({
        name: "",
        phone: "123",
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
      expect(res.errors.phone).toBeDefined();
    });
  });
});
