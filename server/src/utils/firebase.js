import admin from 'firebase-admin';
import config from '../config/index.js';

let firebaseApp = null;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  if (!config.FIREBASE_PROJECT_ID || !config.FIREBASE_CLIENT_EMAIL || !config.FIREBASE_PRIVATE_KEY) {
    console.warn('[FIREBASE] Missing credentials — push notifications disabled');
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY,
    }),
  });

  console.log('[FIREBASE] Admin SDK initialized');
  return firebaseApp;
}

export const TOPICS = {
  ALL_USERS: 'all_users',
  packageTopic: (packageId) => `package_${packageId}`,
  regionTopic: (state) => `region_${state.toLowerCase().replace(/\s+/g, '_')}`,
};

export async function sendToDevice(token, notification, data = {}) {
  if (!getFirebaseApp()) return null;
  return admin.messaging().send({
    token,
    notification: { title: notification.title, body: notification.body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}

export async function sendToDevices(tokens, notification, data = {}) {
  if (!tokens?.length || !getFirebaseApp()) return null;
  return admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title: notification.title, body: notification.body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}

export async function sendToTopic(topic, notification, data = {}) {
  if (!getFirebaseApp()) return null;
  return admin.messaging().send({
    topic,
    notification: { title: notification.title, body: notification.body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}

export async function subscribeToTopic(tokens, topic) {
  if (!getFirebaseApp()) return null;
  return admin.messaging().subscribeToTopic(tokens, topic);
}

export async function unsubscribeFromTopic(tokens, topic) {
  if (!getFirebaseApp()) return null;
  return admin.messaging().unsubscribeFromTopic(tokens, topic);
}

export async function sendWithRetry(sendFn, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await sendFn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = 2 ** attempt * 500;
        console.warn(`[FIREBASE] Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error('[FIREBASE] All retry attempts failed:', lastError?.message);
  return null;
}
