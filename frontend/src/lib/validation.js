/**
 * Form validation helpers for beta onboarding.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate the signup form fields.
 * Returns an object of { fieldName: errorMessage } for any invalid fields,
 * or an empty object if all fields are valid.
 */
export function validateSignupForm({ fullName, email, protectedPhone }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = "Full name is required.";
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!protectedPhone.trim()) errors.protectedPhone = "Protected phone number is required.";
  return errors;
}
