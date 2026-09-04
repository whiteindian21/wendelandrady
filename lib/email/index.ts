import { getSiteUrl } from "@/lib/site-url";

/**
 * Invitation email transport.
 *
 * No SDK dependency: when RESEND_API_KEY is set, emails are sent through
 * Resend's REST API with plain fetch. When it is not set (local development),
 * the email is printed to the server console and the invite link is returned
 * to the inviting admin in the UI so the flow stays testable end-to-end.
 * Credentials live only in environment variables — never in code.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type InvitationEmailPayload = {
  to: string;
  organizationName: string;
  inviterName: string;
  role: "admin" | "member";
  /** Raw invitation token already appended: <site>/invite/<token> */
  token: string;
  expiresAt: Date;
};

function invitationHtml(payload: InvitationEmailPayload): string {
  const acceptUrl = `${getSiteUrl()}/invite/${payload.token}`;
  return `
<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border:1px solid #e5e5e0;border-radius:12px;">
          <tr><td style="padding:32px 32px 8px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#737370;">${payload.organizationName}</p>
            <h1 style="margin:8px 0 0;font-size:20px;color:#1c1c1a;">You've been invited</h1>
          </td></tr>
          <tr><td style="padding:8px 32px 0;">
            <p style="margin:0;font-size:14px;line-height:22px;color:#525250;">
              <strong style="color:#1c1c1a;">${payload.inviterName}</strong> invited you to join
              <strong style="color:#1c1c1a;">${payload.organizationName}</strong> as
              <strong style="color:#1c1c1a;">${payload.role}</strong>.
            </p>
            <p style="margin:16px 0 0;font-size:14px;line-height:22px;color:#525250;">
              This invitation is personal to <strong>${payload.to}</strong> and expires on
              ${payload.expiresAt.toDateString()}.
            </p>
          </td></tr>
          <tr><td style="padding:24px 32px 8px;">
            <a href="${acceptUrl}"
               style="display:inline-block;background:#1c1c1a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
              Accept invitation
            </a>
          </td></tr>
          <tr><td style="padding:8px 32px 32px;">
            <p style="margin:0;font-size:12px;line-height:20px;color:#8a8a86;">
              Or paste this link into your browser:<br>
              <a href="${acceptUrl}" style="color:#525250;">${acceptUrl}</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function sendViaResend(payload: InvitationEmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: `Join ${payload.organizationName} on B2B SaaS OS`,
        html: invitationHtml(payload),
      }),
    });

    if (!response.ok) {
      console.error("[email] Resend delivery failed:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Resend delivery error:", error);
    return false;
  }
}

/**
 * Sends the invitation email. Returns whether the message was delivered
 * through a real provider; false means development/console mode (the caller
 * surfaces the invite link in the UI instead).
 */
export async function sendInvitationEmail(
  payload: InvitationEmailPayload
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.info(
      `[email:dev] Invitation for ${payload.to} (${payload.role}) — accept link: ${getSiteUrl()}/invite/${payload.token}`
    );
    return false;
  }
  return sendViaResend(payload);
}