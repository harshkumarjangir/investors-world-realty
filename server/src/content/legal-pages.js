const COMPANY = 'Investors World Realty Pvt. Ltd.';
const SUPPORT_EMAIL = 'support@investorsworldrealty.com';
const SUPPORT_PHONE = '+91 98765 43210';
const WEBSITE = 'https://investorsworldrealty.com';

function pageShell({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ${COMPANY}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px 20px 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #1f2937;
      background: #fafafa;
    }
    h1 { font-size: 1.35rem; color: #92400e; margin: 0 0 8px; }
    h2 { font-size: 1.05rem; color: #374151; margin: 24px 0 8px; }
    p, li { margin: 0 0 12px; }
    ul { padding-left: 1.25rem; margin: 0 0 16px; }
    a { color: #b45309; }
    .meta { font-size: 0.8rem; color: #6b7280; margin-bottom: 20px; }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
      max-width: 720px;
      margin: 0 auto;
    }
    .contact-row { margin: 8px 0; }
    .label { font-weight: 600; color: #374151; }
  </style>
</head>
<body>
  <div class="card">
    ${body}
  </div>
</body>
</html>`;
}

export function getPrivacyPolicyHtml() {
  const updated = new Date().toISOString().slice(0, 10);
  return pageShell({
    title: 'Privacy Policy',
    body: `
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: ${updated}</p>
    <p>${COMPANY} ("we", "us", or "our") operates the Investors World Realty mobile application and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app.</p>

    <h2>1. Information We Collect</h2>
    <ul>
      <li><strong>Account data:</strong> name, email, phone number, address, KYC documents, sponsor and genealogy details.</li>
      <li><strong>Financial data:</strong> wallet balance, transactions, withdrawals, commission and income records.</li>
      <li><strong>Device &amp; usage data:</strong> app version, device type, IP address, and logs for security and analytics.</li>
      <li><strong>Communications:</strong> support tickets, property inquiries, and contact form submissions.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To register, verify, and manage your associate account.</li>
      <li>To process commissions, wallet transfers, and withdrawals.</li>
      <li>To display properties, genealogy, and income reports.</li>
      <li>To send OTPs, notifications, and service-related messages.</li>
      <li>To comply with legal obligations and prevent fraud.</li>
    </ul>

    <h2>3. Sharing of Information</h2>
    <p>We do not sell your personal data. We may share information with payment processors, KYC verification partners, cloud hosting providers, and authorities when required by law.</p>

    <h2>4. Data Security</h2>
    <p>We use industry-standard measures including encrypted connections (HTTPS), access controls, and secure authentication. No method of transmission over the internet is 100% secure.</p>

    <h2>5. Data Retention</h2>
    <p>We retain your data for as long as your account is active and as required for legal, tax, and regulatory purposes.</p>

    <h2>6. Your Rights</h2>
    <p>You may request access, correction, or deletion of your personal data by contacting us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>, subject to applicable law.</p>

    <h2>7. Children's Privacy</h2>
    <p>Our services are not intended for users under 18 years of age.</p>

    <h2>8. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. Continued use of the app after changes constitutes acceptance of the updated policy.</p>

    <h2>9. Contact Us</h2>
    <p>${COMPANY}<br/>
    Email: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a><br/>
    Website: <a href="${WEBSITE}">${WEBSITE}</a></p>
    `,
  });
}

export function getTermsHtml() {
  const updated = new Date().toISOString().slice(0, 10);
  return pageShell({
    title: 'Terms &amp; Conditions',
    body: `
    <h1>Terms &amp; Conditions</h1>
    <p class="meta">Last updated: ${updated}</p>
    <p>By downloading, registering for, or using the Investors World Realty mobile application, you agree to these Terms &amp; Conditions with ${COMPANY}.</p>

    <h2>1. Eligibility</h2>
    <p>You must be at least 18 years old, legally competent, and provide accurate registration and KYC information. Accounts may be suspended for false or incomplete information.</p>

    <h2>2. Associate Membership</h2>
    <ul>
      <li>Membership is subject to admin approval after registration and KYC verification.</li>
      <li>You are responsible for maintaining the confidentiality of your login credentials and OTP access.</li>
      <li>Sponsor and binary placement rules are determined by company policy and cannot be changed arbitrarily.</li>
    </ul>

    <h2>3. Packages, Income &amp; Commissions</h2>
    <p>Income plans, commission slabs, capping, and payouts are defined by the company and may be updated with notice. Projected earnings from calculators are estimates only, not guarantees.</p>

    <h2>4. Wallet &amp; Withdrawals</h2>
    <ul>
      <li>Wallet balances reflect approved credits minus debits and pending holds.</li>
      <li>Withdrawals are processed per company policy and may require minimum amounts, fees, or KYC clearance.</li>
      <li>Fraudulent transfers or chargebacks may result in account suspension.</li>
    </ul>

    <h2>5. Properties &amp; Listings</h2>
    <p>Property information is provided for marketing purposes. Availability, pricing, and legal title must be verified independently before any transaction.</p>

    <h2>6. Prohibited Conduct</h2>
    <ul>
      <li>Misrepresentation, spam, or unauthorized solicitation using company branding.</li>
      <li>Attempting to hack, reverse engineer, or abuse the API or app.</li>
      <li>Money laundering or activities violating Indian law.</li>
    </ul>

    <h2>7. Intellectual Property</h2>
    <p>All logos, content, software, and materials are owned by ${COMPANY} or its licensors. You may not copy or redistribute them without written permission.</p>

    <h2>8. Limitation of Liability</h2>
    <p>To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the app or reliance on commission projections.</p>

    <h2>9. Termination</h2>
    <p>We may suspend or terminate accounts for breach of these terms, regulatory requirements, or non-payment. You may request account closure through support.</p>

    <h2>10. Governing Law</h2>
    <p>These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Rajasthan, India, unless otherwise required by law.</p>

    <h2>11. Contact</h2>
    <p>Questions about these terms: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    `,
  });
}

export function getSupportHtml() {
  return pageShell({
    title: 'Help &amp; Support',
    body: `
    <h1>Help &amp; Support</h1>
    <p>We're here to help you with your Investors World Realty associate account, wallet, genealogy, properties, and technical issues.</p>

    <h2>In-App Support</h2>
    <p>Logged-in associates can open a support ticket from the app:</p>
    <ul>
      <li>Go to <strong>Support</strong> in the menu</li>
      <li>Tap <strong>New Ticket</strong> and describe your issue</li>
      <li>Track replies in your ticket thread</li>
    </ul>

    <h2>Contact Us</h2>
    <p class="contact-row"><span class="label">Email:</span> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    <p class="contact-row"><span class="label">Phone:</span> <a href="tel:${SUPPORT_PHONE.replace(/\s/g, '')}">${SUPPORT_PHONE}</a></p>
    <p class="contact-row"><span class="label">Website:</span> <a href="${WEBSITE}">${WEBSITE}</a></p>

    <h2>Business Hours</h2>
    <p>Monday – Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays). We aim to respond to tickets within 1–2 business days.</p>

    <h2>Common Topics</h2>
    <ul>
      <li><strong>Login / OTP:</strong> Ensure your registered mobile number is active. Request a new OTP if expired.</li>
      <li><strong>KYC:</strong> Upload clear photos of required documents. Approval may take 24–48 hours.</li>
      <li><strong>Wallet &amp; withdrawals:</strong> Check minimum balance and KYC status before requesting a withdrawal.</li>
      <li><strong>Genealogy:</strong> Sponsor and placement are set at registration per company rules.</li>
    </ul>

    <h2>General Inquiries</h2>
    <p>Visitors and prospects may also use the public contact form on our website or email us directly at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>

    <p class="meta">&copy; ${new Date().getFullYear()} ${COMPANY}</p>
    `,
  });
}
