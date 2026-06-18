import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to find the Profile folder
let profileFolder = null;
for (const item of data.item) {
  if (item.name === 'Profile' || item.name.toLowerCase().includes('profile')) {
    profileFolder = item;
    break;
  }
}

if (profileFolder) {
  // Check if delete-request already exists
  const exists = profileFolder.item.some(i => i.name.includes('Account Deletion'));
  if (!exists) {
    profileFolder.item.push({
      "name": "3.5 Request Account Deletion",
      "request": {
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{access_token}}",
              "type": "string"
            }
          ]
        },
        "method": "POST",
        "header": [],
        "url": {
          "raw": "{{base_url}}/associate/delete-request",
          "host": [
            "{{base_url}}"
          ],
          "path": [
            "associate",
            "delete-request"
          ]
        }
      },
      "response": []
    });
    fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
    console.log('Added Account Deletion API to Postman Collection.');
  } else {
    console.log('Account Deletion API already exists in Postman Collection.');
  }
} else {
  console.log('Could not find Profile folder.');
}
