/**
 * API Configuration & Helper Functions
 * =====================================
 * All API endpoint constants are defined here.
 * Adjust endpoint paths here if the backend shape changes.
 */

const API_BASE = "https://scamcop-api.smokey831831.workers.dev";

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

/* ─── User-facing status labels ─── */

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

const SUCCESS_STATUSES = ["completed", "service_active", "first_test_call_completed", "active", "verified"];
const STARTED_STATUSES = ["sent", "started", "first_test_call_sent", "first_test_call_started"];
const FAILED_STATUSES = ["failed", "error", "needs_attention", "first_test_call_failed"];

/**
 * Determine which state panel (4A/4B/4C/4D) to show from status.
 */
export function deriveResultState(statusString, firstTestCallStatus) {
  const s = firstTestCallStatus || statusString;
  if (!s) return "4A";
  if (SUCCESS_STATUSES.includes(s)) return "4C";
  if (STARTED_STATUSES.includes(s)) return "4B";
  if (FAILED_STATUSES.includes(s)) return "4D";
  return "4A";
}

/* ─── Response field extraction helpers ─── */

function pickFirst(data, ...keys) {
  for (const key of keys) {
    if (data[key] != null) return data[key];
  }
  return null;
}

function extractSubscriberId(data) {
  return pickFirst(data, "subscriber_id", "subscriberId", "id");
}

function extractSubscriberToken(data) {
  return pickFirst(data, "subscriber_token", "subscriberToken", "token");
}

function extractSystemNumber(data) {
  return pickFirst(
    data,
    "telnyx_system_number", "telnyxSystemNumber",
    "assigned_forwarding_number", "assignedForwardingNumber",
    "system_number", "systemNumber",
    "telnyx_number", "telnyxNumber",
    "forwarding_number", "forwardingNumber",
    "assigned_number", "assignedNumber"
  );
}

function extractSubscriberData(data) {
  return {
    subscriberId: extractSubscriberId(data),
    subscriberToken: extractSubscriberToken(data),
    systemNumber: extractSystemNumber(data),
  };
}

function extractActivationData(data) {
  const activation =
    (typeof data.activation === "object" && data.activation) ||
    (typeof data.status === "object" && data.status) ||
    {};

  const firstTestCallStatus = pickFirst(
    data, "first_test_call_status", "firstTestCallStatus"
  ) ?? pickFirst(activation, "first_test_call_status", "firstTestCallStatus");

  const statusString =
    pickFirst(data, "status_label", "statusLabel") ??
    pickFirst(activation, "status", "status_label") ??
    (typeof data.status === "string" ? data.status : null);

  return { firstTestCallStatus, statusString };
}

/* ─── Network / error helpers ─── */

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (networkErr) {
    throw new Error(
      "We could not reach the beta server. Please check your connection and try again."
    );
  }
}

async function handleErrorResponse(response, defaultMessage) {
  const errorData = await response.json().catch(() => ({}));
  if (errorData.error === "feature_disabled") {
    throw new Error("This beta feature is not active yet.");
  }
  if (errorData.error === "missing_token") {
    throw new Error("Your beta session expired. Please restart setup.");
  }
  throw new Error(errorData.message || errorData.error || defaultMessage);
}

/* ─── Public API functions ─── */

export async function createBetaAccount({ fullName, email, protectedPhone }) {
  const response = await safeFetch(ENDPOINTS.ONBOARDING, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fullName,
      email: email,
      protected_phone_number: protectedPhone,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(
      response,
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

export async function markSetupComplete({ subscriberId, subscriberToken }) {
  const response = await safeFetch(ENDPOINTS.SETUP_COMPLETE(subscriberId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${subscriberToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    await handleErrorResponse(
      response,
      "We saved your beta account, but could not mark forwarding as complete. Please try again or contact the beta coordinator."
    );
  }

  return extractActivationData(await response.json());
}

export async function checkForwardingStatus({ subscriberId, subscriberToken }) {
  const response = await safeFetch(ENDPOINTS.FORWARDING_STATUS(subscriberId), {
    method: "GET",
    headers: { Authorization: `Bearer ${subscriberToken}` },
  });

  if (!response.ok) {
    await handleErrorResponse(
      response,
      "Could not check your setup status. Please try again."
    );
  }

  return extractActivationData(await response.json());
}

export async function retryTestCall({ subscriberId, subscriberToken }) {
  const response = await safeFetch(ENDPOINTS.RETRY_TEST_CALL(subscriberId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${subscriberToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    await handleErrorResponse(
      response,
      "We could not restart the test call. Please check your forwarding setup or wait for beta team follow-up."
    );
  }

  return extractActivationData(await response.json());
}
