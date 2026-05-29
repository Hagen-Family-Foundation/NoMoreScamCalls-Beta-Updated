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
  SETUP_COMPLETE: (subscriberId) =>
    `${API_BASE}/subscriber/${subscriberId}/forwarding/setup-complete`,
  FORWARDING_STATUS: (subscriberId) =>
    `${API_BASE}/subscriber/${subscriberId}/forwarding/status`,
  RETRY_TEST_CALL: (subscriberId) =>
    `${API_BASE}/subscriber/${subscriberId}/forwarding/first-test-call/retry`,
};

/**
 * User-facing status labels
 */
export const STATUS_LABELS = {
  setup_not_started: "Setup not started",
  forwarding_number_assigned: "Forwarding number assigned",
  forwarding_confirmed: "Forwarding marked as turned on",
  first_test_call_pending: "First test call pending",
  first_test_call_pending_manual: "First test call pending beta team review",
  first_test_call_sent: "First test call started",
  first_test_call_started: "First test call started",
  first_test_call_completed: "First test call completed",
  service_active: "Protection active",
  active: "Protection active",
  verified: "Protection active",
  completed: "First test call completed",
  failed: "Setup needs attention",
  error: "Setup needs attention",
  needs_attention: "Setup needs attention",
  first_test_call_failed: "Setup needs attention",
  pending: "First test call pending",
  pending_manual: "First test call pending beta team review",
  requested: "First test call pending",
  started: "First test call started",
  sent: "First test call started",
};

/**
 * Determine which state panel (4A/4B/4C/4D) to show from status
 */
export function deriveResultState(statusString, firstTestCallStatus) {
  const s = firstTestCallStatus || statusString;
  if (!s) return "4A"; // default pending

  // 4C: Success / service active
  if (["completed", "service_active", "first_test_call_completed", "active", "verified"].includes(s)) {
    return "4C";
  }
  // 4B: Test call started
  if (["sent", "started", "first_test_call_sent", "first_test_call_started"].includes(s)) {
    return "4B";
  }
  // 4D: Needs attention
  if (["failed", "error", "needs_attention", "first_test_call_failed"].includes(s)) {
    return "4D";
  }
  // 4A: Pending (default)
  return "4A";
}

/**
 * Defensively extract subscriber fields from response.
 */
function extractSubscriberData(data) {
  const subscriberId =
    data.subscriber_id || data.subscriberId || data.id || null;
  const subscriberToken =
    data.subscriber_token || data.subscriberToken || data.token || null;
  const systemNumber =
    data.telnyx_system_number ||
    data.telnyxSystemNumber ||
    data.assigned_forwarding_number ||
    data.assignedForwardingNumber ||
    data.system_number ||
    data.systemNumber ||
    data.telnyx_number ||
    data.telnyxNumber ||
    data.forwarding_number ||
    data.forwardingNumber ||
    data.assigned_number ||
    data.assignedNumber ||
    null;

  return { subscriberId, subscriberToken, systemNumber };
}

/**
 * Defensively extract activation/status from any response
 */
function extractActivationData(data) {
  const activation = data.activation || data.status || {};
  const firstTestCallStatus =
    data.first_test_call_status ||
    data.firstTestCallStatus ||
    activation.first_test_call_status ||
    activation.firstTestCallStatus ||
    null;
  const statusString =
    data.status_label ||
    data.statusLabel ||
    activation.status ||
    activation.status_label ||
    (typeof data.status === "string" ? data.status : null) ||
    null;

  return { activation, firstTestCallStatus, statusString };
}

/**
 * Create beta subscriber account.
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
      "We could not reach the beta server. Please check your connection and try again."
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
      "Your beta account was created, but your secure beta session was not returned. Please contact the beta coordinator."
    );
  }

  return { subscriberId, subscriberToken, systemNumber };
}

/**
 * Mark forwarding setup as complete.
 */
export async function markSetupComplete({ subscriberId, subscriberToken }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.SETUP_COMPLETE(subscriberId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${subscriberToken}`,
      },
      body: JSON.stringify({}),
    });
  } catch (networkErr) {
    throw new Error(
      "We could not reach the beta server. Please check your connection and try again."
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
      "We saved your beta account, but could not mark forwarding as complete. Please try again or contact the beta coordinator."
    );
  }

  const data = await response.json();
  return extractActivationData(data);
}

/**
 * Check forwarding/setup status.
 */
export async function checkForwardingStatus({ subscriberId, subscriberToken }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.FORWARDING_STATUS(subscriberId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${subscriberToken}`,
      },
    });
  } catch (networkErr) {
    throw new Error(
      "We could not reach the beta server. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "missing_token") {
      throw new Error("Your beta session expired. Please restart setup.");
    }
    throw new Error(
      errorData.message ||
      errorData.error ||
      "Could not check your setup status. Please try again."
    );
  }

  const data = await response.json();
  return extractActivationData(data);
}

/**
 * Retry first test call.
 */
export async function retryTestCall({ subscriberId, subscriberToken }) {
  let response;
  try {
    response = await fetch(ENDPOINTS.RETRY_TEST_CALL(subscriberId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${subscriberToken}`,
      },
      body: JSON.stringify({}),
    });
  } catch (networkErr) {
    throw new Error(
      "We could not reach the beta server. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "missing_token") {
      throw new Error("Your beta session expired. Please restart setup.");
    }
    throw new Error(
      errorData.message ||
      errorData.error ||
      "We could not restart the test call. Please check your forwarding setup or wait for beta team follow-up."
    );
  }

  const data = await response.json();
  return extractActivationData(data);
}
