/**
 * Custom Mail Service using Resend API (Direct HTTPS)
 * Bypasses outbound SMTP port blocks imposed by platforms like Render.
 */

const resendApiKey = process.env.RESEND_API_KEY || '';
const resendFrom = process.env.RESEND_FROM || '"InboxFixer" <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resendApiKey) {
    console.warn('Resend API key is not configured in environment variables. Printing email to developer console:');
    console.log(`--- [DEVELOPER MOCK EMAIL] ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${html}`);
    console.log(`-----------------------------`);
    return { success: true, printed: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Resend API returned status code ${res.status}`);
    }

    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error('Failed to send email via Resend API:', error.message || error);
    throw error;
  }
}
