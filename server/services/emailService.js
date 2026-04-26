const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// ---------------------------------------------------------------------------
// Bauhaus design-system helpers (inline-CSS, table-based, no external assets)
// ---------------------------------------------------------------------------

/**
 * Shared Bauhaus email wrapper — header + body + footer.
 * @param {string} heading - uppercase heading text for the header
 * @param {string} bodyContent - inner HTML for the body section
 * @returns {string} complete HTML email string
 */
const bauhausWrapper = (heading, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fafaf5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf5;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;border:3px solid #1a1a2e;">
        <!-- HEADER -->
        <tr>
          <td style="background-color:#1a1a2e;padding:28px 32px;text-align:center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:4px;color:#fafaf5;text-transform:uppercase;text-align:center;padding-bottom:4px;">
                  PMS &nbsp;&middot;&nbsp; PLACEMENT MANAGEMENT SYSTEM
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;letter-spacing:3px;color:#fafaf5;text-transform:uppercase;text-align:center;">
                  ${heading}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- RED ACCENT STRIP -->
        <tr>
          <td style="background-color:#e63946;height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="background-color:#fafaf5;padding:32px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background-color:#f0efe6;border-top:3px solid #1a1a2e;padding:20px 32px;text-align:center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888;text-align:center;line-height:1.6;">
                  &copy; ${new Date().getFullYear()} PMS &middot; Placement Management System<br>
                  This is an automated message. Please do not reply directly to this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;

/**
 * Bauhaus-styled OTP box
 * @param {string} otp
 * @returns {string}
 */
const otpBox = (otp) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0efe6;border:3px solid #1a1a2e;padding:24px 40px;">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:bold;letter-spacing:10px;color:#1a1a2e;text-align:center;">
            ${otp}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/**
 * Yellow geometric accent bar (thin decorative element)
 * @returns {string}
 */
const yellowAccent = () => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 4px 0;">
  <tr>
    <td style="background-color:#f4d03f;height:3px;font-size:0;line-height:0;width:60px;" width="60">&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>`;

// ---------------------------------------------------------------------------
// Core email sender
// ---------------------------------------------------------------------------

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"PMS - Placement Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw new Error('Failed to send email');
  }
};

// ---------------------------------------------------------------------------
// OTP Emails (Registration / Login / Password Reset)
// ---------------------------------------------------------------------------

/**
 * Send OTP email
 * @param {string} email - recipient email
 * @param {string} otp - the OTP code (plain text)
 * @param {string} purpose - 'verification' | 'login' | 'reset'
 */
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const purposeText = {
    verification: 'Email Verification',
    login: 'Login Verification',
    reset: 'Password Reset'
  };

  const subject = `PMS - ${purposeText[purpose] || 'OTP Verification'}`;

  // --- Purpose-specific content ---
  let heading, subtextHtml, expiryMinutes, securityNote;

  if (purpose === 'login') {
    heading = 'LOGIN VERIFICATION';
    subtextHtml = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:8px;">
        Hello,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:4px;">
        A login attempt was made on your PMS account. Use the OTP below to complete your secure login:
      </td></tr>`;
    expiryMinutes = '5 minutes';
    securityNote = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888;padding-top:12px;border-left:4px solid #e63946;padding-left:12px;">
        If you did not attempt to log in, you can safely ignore this email. Your account remains secure.
      </td></tr>`;
  } else if (purpose === 'reset') {
    heading = 'PASSWORD RESET';
    subtextHtml = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:8px;">
        Hello,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:4px;">
        We received a request to reset the password for your PMS account. Use the OTP below to proceed:
      </td></tr>`;
    expiryMinutes = '10 minutes';
    securityNote = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888;padding-top:12px;border-left:4px solid #e63946;padding-left:12px;">
        &#9888; If you did not request a password reset, please ignore this email. Your password will remain unchanged. If you suspect unauthorized access, please contact support immediately.
      </td></tr>`;
  } else {
    // verification (registration)
    heading = 'VERIFY YOUR EMAIL';
    subtextHtml = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:8px;">
        Hello,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:4px;">
        Thank you for creating an account on PMS. Please use the OTP below to verify your email address and complete your registration:
      </td></tr>`;
    expiryMinutes = '10 minutes';
    securityNote = `
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888;padding-top:12px;border-left:4px solid #e63946;padding-left:12px;">
        If you did not create an account on PMS, please ignore this email.
      </td></tr>`;
  }

  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${subtextHtml}
      <tr><td>${otpBox(otp)}</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1a1a2e;text-align:center;padding-bottom:4px;">
        <span style="font-weight:bold;text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;">EXPIRES IN</span><br>
        <strong>${expiryMinutes}</strong>
      </td></tr>
      ${yellowAccent()}
      ${securityNote}
    </table>`;

  const html = bauhausWrapper(heading, bodyContent);

  return sendEmail(email, subject, html);
};

// ---------------------------------------------------------------------------
// Interview Reminder Email
// ---------------------------------------------------------------------------

/**
 * Send interview reminder email
 * @param {string} email - recipient student email
 * @param {object} interview - interview details
 * @param {string} interview.roundName - name of the interview round
 * @param {string} interview.companyName - company name
 * @param {string} interview.jobTitle - job title
 * @param {string} interview.date - formatted date string
 * @param {string} interview.time - formatted time string
 * @param {string} interview.mode - 'online' or 'offline'
 * @param {string} [interview.venue] - venue (offline interviews)
 * @param {string} [interview.meetingLink] - meeting link (online interviews)
 */
const sendInterviewReminderEmail = async (email, interview) => {
  const subject = `PMS - Interview Reminder: ${interview.roundName} at ${interview.companyName}`;

  const locationRow = interview.mode === 'online' && interview.meetingLink
    ? `<tr>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">MEETING LINK</td>
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;"><a href="${interview.meetingLink}" style="color:#1a56db;text-decoration:underline;">${interview.meetingLink}</a></td>
       </tr>`
    : interview.venue
      ? `<tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">VENUE</td>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${interview.venue}</td>
         </tr>`
      : '';

  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:16px;">
        Hello,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:20px;">
        This is a reminder that you have an upcoming interview scheduled. Please review the details below:
      </td></tr>

      <!-- Interview Details Card -->
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:3px solid #1a1a2e;border-left:4px solid #e63946;margin-bottom:24px;">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">ROUND</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;font-weight:bold;">${interview.roundName}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">COMPANY</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${interview.companyName}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">POSITION</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${interview.jobTitle}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">DATE &amp; TIME</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${interview.date} &nbsp;at&nbsp; <strong>${interview.time}</strong></td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:130px;vertical-align:top;">MODE</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;text-transform:capitalize;">${interview.mode}</td>
          </tr>
          ${locationRow}
        </table>
      </td></tr>

      ${yellowAccent()}

      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-top:16px;">
        Prepare well and give it your best — every interview is a step closer to your dream career. Good luck! &#128170;
      </td></tr>
    </table>`;

  const html = bauhausWrapper('INTERVIEW REMINDER', bodyContent);

  return sendEmail(email, subject, html);
};

// ---------------------------------------------------------------------------
// Contact Form Emails
// ---------------------------------------------------------------------------

/**
 * Build HTML for the admin contact-form notification email
 * @param {object} data
 * @param {string} data.name - sender name
 * @param {string} data.email - sender email
 * @param {string} data.subject - message subject
 * @param {string} data.message - message body
 * @param {string} data.companyName - PMS company name (from settings)
 * @returns {string} HTML string
 */
const buildContactAdminHtml = ({ name, email, subject, message, companyName }) => {
  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:16px;">
        A new message has been submitted through the Contact Us form on <strong>${companyName}</strong>.
      </td></tr>

      <!-- Sender Details Card -->
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:3px solid #1a1a2e;border-left:4px solid #e63946;margin-bottom:24px;">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:120px;vertical-align:top;">NAME</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${name}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:120px;vertical-align:top;">EMAIL</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">
              <a href="mailto:${email}" style="color:#1a56db;text-decoration:underline;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;border-bottom:1px solid #e0ddd4;width:120px;vertical-align:top;">SUBJECT</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;border-bottom:1px solid #e0ddd4;">${subject}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding:10px 16px;width:120px;vertical-align:top;">MESSAGE</td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding:10px 16px;white-space:pre-wrap;line-height:1.6;">${message}</td>
          </tr>
        </table>
      </td></tr>

      ${yellowAccent()}

      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#888;line-height:1.6;padding-top:8px;">
        Reply directly to this email to respond to <strong style="color:#1a1a2e;">${name}</strong>.
      </td></tr>
    </table>`;

  return bauhausWrapper('NEW CONTACT FORM SUBMISSION', bodyContent);
};

/**
 * Build HTML for the auto-reply email sent to a contact-form submitter
 * @param {object} data
 * @param {string} data.name - submitter name
 * @param {string} data.message - original message
 * @param {string} data.companyName - PMS company name (from settings)
 * @returns {string} HTML string
 */
const buildContactAutoReplyHtml = ({ name, message, companyName }) => {
  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:8px;">
        Hello <strong>${name}</strong>,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:20px;">
        Thank you for reaching out to us. We have received your message and our team will review it shortly.
      </td></tr>

      <!-- Echo of their message -->
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding-bottom:8px;">
              YOUR MESSAGE
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;line-height:1.6;padding:16px;background-color:#f0efe6;border-left:4px solid #e63946;white-space:pre-wrap;">
              ${message}
            </td>
          </tr>
        </table>
      </td></tr>

      ${yellowAccent()}

      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-top:12px;">
        You can expect a response within <strong>1–2 business days</strong>.
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-top:20px;">
        Best regards,<br>
        <strong>${companyName}</strong>
      </td></tr>
    </table>`;

  return bauhausWrapper('WE RECEIVED YOUR MESSAGE', bodyContent);
};

// ---------------------------------------------------------------------------
// Temporary Password Email (Forgot Password Flow)
// ---------------------------------------------------------------------------

/**
 * Send temporary password email
 * @param {string} email - recipient email
 * @param {string} tempPassword - the generated temporary password (plain text)
 */
const sendTempPasswordEmail = async (email, tempPassword) => {
  const subject = 'PMS — Your Temporary Password';

  const bodyContent = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:8px;">
        Hello,
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a2e;padding-bottom:20px;">
        A temporary password has been generated for your PMS account. Use it to log in and set a new permanent password immediately.
      </td></tr>

      <!-- Temp Password Box -->
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0efe6;border:3px solid #1a1a2e;padding:20px 36px;">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;text-align:center;padding-bottom:8px;">
                    YOUR TEMPORARY PASSWORD
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:bold;letter-spacing:4px;color:#e63946;text-align:center;background-color:#fff;border:2px solid #1a1a2e;padding:12px 24px;">
                    ${tempPassword}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      ${yellowAccent()}

      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#888;padding-bottom:8px;padding-top:8px;">
        NEXT STEPS
      </td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#1a1a2e;padding-bottom:4px;">
        1. Go to PMS and <strong>log in</strong> using the temporary password above.<br>
        2. You will be prompted to <strong>set a new permanent password</strong>.<br>
        3. Choose a strong password (minimum 8 characters).
      </td></tr>

      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888;padding-top:16px;border-left:4px solid #e63946;padding-left:12px;">
        &#9888; If you did not request this password reset, your account may have been compromised. Please contact the administrator immediately.
      </td></tr>
    </table>`;

  const html = bauhausWrapper('TEMPORARY PASSWORD', bodyContent);

  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendInterviewReminderEmail,
  sendTempPasswordEmail,
  buildContactAdminHtml,
  buildContactAutoReplyHtml
};
