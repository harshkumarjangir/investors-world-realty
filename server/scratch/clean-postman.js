import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

const walletFolder = data.item.find(i => i.name.includes('7. Wallet'));

if (walletFolder) {
  // Filter out the old APIs
  walletFolder.item = walletFolder.item.filter(i => {
    return ![
      'Get Balance',
      'Transaction History',
      'Withdrawal History'
    ].includes(i.name);
  });

  fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
  console.log('Postman collection cleaned successfully!');
} else {
  console.log('Wallet folder not found.');
}
