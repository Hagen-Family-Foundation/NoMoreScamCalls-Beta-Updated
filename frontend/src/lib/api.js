/**
 * API Configuration & Helper Functions
 * =====================================
 * All API endpoint constants are defined here.
 * Adjust endpoint paths here if the backend shape changes.
 */

const API_BASE = "https://scamcop-api.smokey831831.workers.dev";

// Endpoint paths (adjust here if needed)
const ENDPOINTS = {
  HEALTH: `${API_BASE}/health`,
  ONBOARDING: `${API_BASE}/subscriber/onboarding`,
  VERIFY_START: (subscriberId) =>
    `${API_BASE}/subscriber/${subscriberId}/forwarding/verify/start`,
  VERIFY_CONFIRM: (subscriberId) =>
    `${API_BASE}/subscriber/${subscriberId}/forwarding/verify/confirm`,
};

/**
 * Defensively extract subscriber fields from response
 * Handles various field name formats the backend might return
 */
function extractSubscriberData(data) {
  const subscriberId =
    data.subscriber_id || data.subscriberId || data.id || null;
  const subscriberToken =
    data.subscriber_token || data.subscriberToken || data.token || null;
  return { subscriberId, subscriberToken };
}

/**
 * Create beta subscriber account
 */
export async function createBetaAccount({ fullName, email, protectedPhone, forwardingPhone }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.ONBOARDING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: email,
        protected_phone_number: protectedPhone,
        forwarding_target_number: forwardingPhone,
      }),
    });
  } catch (networkErr) {
    throw new Error(
      "Something went wrong creating your beta account. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "feature_disabled") {
      throw new Error("This beta feature is not active yet.");
    }
    throw new Error(
      errorData.message ||
      errorData.error ||
      "Something went wrong creating your beta account. Please check your information and try again."
    );
  }

  const data = await response.json();
  const { subscriberId, subscriberToken } = extractSubscriberData(data);

  if (!subscriberId) {
    throw new Error(
      "Your beta account was created, but we could not read the account ID. Please contact the beta coordinator."
    );
  }

  if (!subscriberToken) {
    throw new Error(
      "Your beta account was created, but the access token was not returned. Please contact the beta coordinator."
    );
  }

  return { subscriberId, subscriberToken };
}

/**
 * Send verification code to forwarding number
 */
export async function sendVerificationCode({ subscriberId, subscriberToken }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.VERIFY_START(subscriberId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${subscriberToken}`,
      },
    });
  } catch (networkErr) {
    throw new Error(
      "We could not send the verification code. Please check your connection or contact the beta coordinator."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "feature_disabled") {
      throw new Error("This beta feature is not active yet.");
    }
    if (errorData.error === "missing_token") {
      throw new Error("Your beta session expired. Please restart setup.");
    }
    throw new Error(
      errorData.message ||
      errorData.error ||
      "We could not send the verification code. Please check the forwarding number or contact the beta coordinator."
    );
  }

  return await response.json();
}

/**
 * Confirm verification code
 */
export async function confirmVerificationCode({ subscriberId, subscriberToken, code }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.VERIFY_CONFIRM(subscriberId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${subscriberToken}`,
      },
      body: JSON.stringify({ code }),
    });
  } catch (networkErr) {
    throw new Error(
      "That code did not verify. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "feature_disabled") {
      throw new Error("This beta feature is not active yet.");
    }
    if (errorData.error === "missing_token") {
      throw new Error("Your beta session expired. Please restart setup.");
    }
    throw new Error(
      errorData.message ||
      errorData.error ||
      "That code did not verify. Please check the code and try again."
    );
  }

  return await response.json();
}
