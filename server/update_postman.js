import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to recursively find and update request
function traverse(items) {
  for (const item of items) {
    if (item.item) {
      traverse(item.item);
    } else if (item.request && item.request.url && item.request.url.raw) {
      if (item.request.url.raw.includes('/payment/status')) {
        item.name = '8.9 Update Property Payment Booking';
        item.request.url.raw = item.request.url.raw.replace('/payment/status', '/payment/booking');
        item.request.url.path = item.request.url.path.map(p => p === 'status' ? 'booking' : p);
      }
    }
  }
}

traverse(data.item);

fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
console.log('Postman collection updated successfully (renamed to booking).');
