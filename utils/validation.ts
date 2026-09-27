/**
 * Form validation and sanitization utilities for appointment booking.
 */

export function validatePhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) {
    return { isValid: false, error: "Phone number is required.", formatted: phone };
  }
  if (digits.length < 10) {
    return { isValid: false, error: "Please enter a valid 10-digit phone number.", formatted: phone };
  }
  const formatted = digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone.trim();

  return { isValid: true, formatted };
}

export function validateName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters." };
  }
  return { isValid: true };
}

export function validateDate(dateStr) {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, error: "Appointment date is required." };
  }
  const chosenDate = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isNaN(chosenDate.getTime())) {
    return { isValid: false, error: "Invalid date format." };
  }
  if (chosenDate < now) {
    return { isValid: false, error: "Appointment date cannot be in the past." };
  }
  return { isValid: true };
}

export function validateBookingForm(data) {
  const errors = {};
  const nameCheck = validateName(data.name);
  if (!nameCheck.isValid) errors.name = nameCheck.error;

  const phoneCheck = validatePhone(data.phone);
  if (!phoneCheck.isValid) errors.phone = phoneCheck.error;

  if (data.date) {
    const dateCheck = validateDate(data.date);
    if (!dateCheck.isValid) errors.date = dateCheck.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
