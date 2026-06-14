import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Find the Wallet folder
const walletFolder = data.item.find(i => i.name.includes('7. Wallet'));

if (walletFolder) {
  // Check if they already exist to avoid duplicates
  const hasDashboard = walletFolder.item.some(i => i.name === 'Wallet Dashboard');
  const hasAllActivity = walletFolder.item.some(i => i.name === 'All Activity (Merged)');

  if (!hasDashboard) {
    walletFolder.item.unshift({
      "name": "Wallet Dashboard",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/wallet/dashboard",
          "host": ["{{baseUrl}}"],
          "path": ["wallet", "dashboard"]
        },
        "description": "Returns balance, totalCredits, totalDebits, and a merged array of recent transactions + withdrawals for the Wallet UI."
      }
    });
  }

  if (!hasAllActivity) {
    // Insert after Transaction History
    const txIndex = walletFolder.item.findIndex(i => i.name === 'Transaction History');
    const insertAt = txIndex > -1 ? txIndex + 1 : walletFolder.item.length;
    
    walletFolder.item.splice(insertAt, 0, {
      "name": "All Activity (Merged)",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/wallet/all-activity?page=1&pageSize=20",
          "host": ["{{baseUrl}}"],
          "path": ["wallet", "all-activity"],
          "query": [
            { "key": "page", "value": "1" },
            { "key": "pageSize", "value": "20" }
          ]
        },
        "description": "Returns perfectly paginated, chronologically sorted, and merged regular transactions + withdrawals for the 'See All' screen."
      }
    });
  }

  fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
  console.log('Postman collection updated successfully!');
} else {
  console.log('Wallet folder not found in collection.');
}
