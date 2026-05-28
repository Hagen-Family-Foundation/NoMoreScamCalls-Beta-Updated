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

  // Extract the assigned ScamStop/Telnyx forwarding number
  const systemNumber =
    data.system_number ||
    data.systemNumber ||
    data.telnyx_number ||
    data.telnyxNumber ||
    data.forwarding_number ||
    data.forwardingNumber ||
    data.assigned_number ||
    data.assignedNumber ||
    data.scamstop_number ||
    data.scamstopNumber ||
    null;

  return { subscriberId, subscriberToken, systemNumber };
}

/**
 * Create beta subscriber account
 * Only collects: name, email, protected phone number
 */
export async function createBetaAccount({ fullName, email, protectedPhone }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.ONBOARDING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: email,
        protected_phone_number: protectedPhone,
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
  const { subscriberId, subscriberToken, systemNumber } = extractSubscriberData(data);

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

  return { subscriberId, subscriberToken, systemNumber };
}
