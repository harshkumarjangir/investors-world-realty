import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const orderId = process.argv[2];
if (!orderId) {
  console.log("Please provide an order ID as an argument.");
  console.log("Usage: node generate_test_payment.js <order_id>");
  process.exit(1);
}

const secret = process.env.RAZORPAY_KEY_SECRET;
if (!secret) {
  console.log("Error: RAZORPAY_KEY_SECRET is not set in .env");
  process.exit(1);
}

const paymentId = "pay_test_" + Math.random().toString(36).substring(2, 10);

const signature = crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

console.log("\n=== VALID TEST PAYLOAD ===");
console.log(JSON.stringify({
  status: "SUCCESS",
  razorpayOrderId: orderId,
  razorpayPaymentId: paymentId,
  razorpaySignature: signature
}, null, 2));
console.log("==========================\n");
