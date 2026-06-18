import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

data.variable = [
  {
    "key": "base_url",
    "value": "http://localhost:5001/api/v1",
    "type": "string"
  },
  {
    "key": "access_token",
    "value": "",
    "type": "string"
  }
];

fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
console.log('Added Collection Variables successfully.');
