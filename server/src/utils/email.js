import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
    // Force IPv4 — some hosts (Railway, Render) don't support IPv6
    family: 4,
  });

  return transporter;
}

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
export async function sendEmail(to, subject, html) {
  const transport = getTransporter();

  if (!config.SMTP_HOST || !config.SMTP_USER) {
    console.warn('[EMAIL] SMTP not configured. Email not sent to:', to);
    console.warn('[EMAIL] Subject:', subject);
    return null;
  }

  try {
    const info = await transport.sendMail({
      from: `"Investors World Realty" <${config.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to} | MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
    return null;
  }
}

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 */
export async function sendOtpEmail(to, otp) {
  const subject = 'Your Login OTP - Investors World Realty';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #C8922A; margin: 0;">Investors World Realty</h2>
        <p style="color: #666; font-size: 14px;">Admin Panel Login</p>
      </div>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Your One-Time Password (OTP) is:</p>
        <div style="background: #fff; border: 2px solid #C8922A; border-radius: 8px; padding: 15px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C8922A;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 13px; margin-top: 20px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

/**
 * Send registration confirmation email to new associate.
 * Tells them their User ID and that they need to wait for admin approval.
 */
export async function sendRegistrationEmail(to, { name, userId, sponsorId }) {
  const subject = 'Registration Received - Investors World Realty';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h2 style="color: #D49428; margin: 0; font-size: 22px;">Investors World Realty</h2>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Registration Confirmation</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #1e293b; font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Thank you for registering with <strong>Investors World Realty Pvt. Ltd.</strong>
          Your registration has been received and is currently <strong>pending admin approval</strong>.
        </p>
        <div style="background: #f8fafc; border: 2px solid #D49428; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Your User ID</p>
          <p style="color: #D49428; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 0;">${userId}</p>
          <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0;">Save this — you will need it to log in</p>
        </div>
        ${sponsorId ? `<p style="color: #475569; font-size: 13px;">Sponsor ID: <strong>${sponsorId}</strong></p>` : ''}
        <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
          <p style="color: #713f12; font-size: 13px; margin: 0;">
            ⏳ Your account is <strong>pending approval</strong>. You will receive another email once admin activates your account.
          </p>
        </div>
        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          Once approved, you can log in to the Investors World Realty mobile app using:<br/>
          <strong>User ID:</strong> ${userId}<br/>
          <strong>Password:</strong> The password you set during registration
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not register, please ignore this email.
        </p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

/**
 * Send account activation email after admin approves.
 */
export async function sendActivationEmail(to, { name, userId }) {
  const subject = 'Account Activated - Welcome to Investors World Realty!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h2 style="color: #D49428; margin: 0; font-size: 22px;">Investors World Realty</h2>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Account Activated</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #1e293b; font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
          <p style="color: #15803d; font-size: 18px; font-weight: bold; margin: 0;">✅ Your account has been activated!</p>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Congratulations! Your Investors World Realty associate account is now <strong>active</strong>.
          You can now log in to the mobile app and start using all features.
        </p>
        <div style="background: #f8fafc; border: 2px solid #D49428; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Your Login Details</p>
          <p style="color: #D49428; font-size: 26px; font-weight: bold; letter-spacing: 4px; margin: 0;">${userId}</p>
          <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0;">Use this User ID with your registered password</p>
        </div>
        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          A HEARTLY WELCOME TO INVESTORS WORLD REALTY PVT. LTD.!<br/><br/>
          We are delighted to have you as part of our family. You can now log in using the mobile app and start your journey with us.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          &copy; Investors World Realty Pvt. Ltd. | If you have questions, contact support.
        </p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}
