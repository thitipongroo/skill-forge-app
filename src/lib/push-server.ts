import webpush from "web-push";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) throw new Error("VAPID keys are not configured");
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export interface PushTarget { endpoint: string; p256dh: string; auth: string; }

export async function sendPush(target: PushTarget, payload: Record<string, unknown>) {
  ensureConfigured();
  return webpush.sendNotification(
    { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
    JSON.stringify(payload)
  );
}
