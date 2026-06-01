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
