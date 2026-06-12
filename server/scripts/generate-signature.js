import crypto from 'crypto';
import config from '../src/config/index.js';

// Get orderId and paymentId from arguments
const orderId = process.argv[2];
const paymentId = process.argv[3];

if (!orderId || !paymentId) {
  console.log('\nUsage: node scripts/generate-signature.js <orderId> <paymentId>\n');
  process.exit(1);
}

const secret = config.RAZORPAY_KEY_SECRET;
const generatedSignature = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

console.log('\n----------------------------------------');
console.log(`Razorpay Key Secret: "${secret}"`);
console.log(`Order ID:            "${orderId}"`);
console.log(`Payment ID:          "${paymentId}"`);
console.log(`Signature:           "${generatedSignature}"`);
console.log('----------------------------------------\n');
