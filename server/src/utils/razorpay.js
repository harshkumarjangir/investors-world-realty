import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/index.js';

let razorpay = null;

export function getRazorpayInstance() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = config.RAZORPAY_KEY_SECRET;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}
