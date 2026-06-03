import { readFileSync, writeFileSync } from 'fs';

const path = 'C:/Users/harsh/Desktop/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const col = JSON.parse(readFileSync(path, 'utf8'));

const authFolder = col.item.find(f => f.name && f.name.includes('Auth'));
const logoutItem = authFolder?.item.find(i => i.name && i.name.toLowerCase().includes('logout'));

if (logoutItem) {
  logoutItem.request.body = { "mode": "none" };
  logoutItem.request.description =
    'Logs out the user by blacklisting the current access token.\n\n' +
    '🔒 Requires: `Authorization: Bearer {{accessToken}}`\n\n' +
    '**No body needed.**\n\n' +
    'FCM device token is NOT removed — push notifications continue to reach the device. ' +
    'This is intentional: the device can still receive notifications even when the user is logged out ' +
    '(e.g., account activation, announcements). Firebase handles stale tokens automatically.';
  console.log('✅ Logout updated — no body');
}

writeFileSync(path, JSON.stringify(col, null, 2));
console.log('✅ Saved');
