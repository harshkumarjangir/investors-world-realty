import fs from 'fs';

const collectionPath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Restore original variables
data.variable = [
  {
    "key": "baseUrl",
    "value": "http://localhost:5001/api/v1",
    "description": "Local dev URL"
  },
  {
    "key": "prodUrl",
    "value": "https://serveriwr.harshkumarjangir.in/api/v1",
    "description": "Production URL"
  },
  {
    "key": "accessToken",
    "value": "",
    "description": "Set automatically after OTP verify"
  },
  {
    "key": "refreshToken",
    "value": "",
    "description": "Set automatically after OTP verify"
  },
  {
    "key": "associateId",
    "value": "",
    "description": "Set automatically after login step 1"
  }
];

// Fix the delete-request item that I added with wrong variables
function traverse(items) {
  for (const item of items) {
    if (item.item) {
      traverse(item.item);
    } else if (item.request && item.request.url && item.request.url.raw) {
      if (item.name === "3.5 Request Account Deletion") {
        item.request.url.raw = "{{baseUrl}}/associate/delete-request";
        item.request.url.host = ["{{baseUrl}}"];
        if (item.request.auth && item.request.auth.bearer) {
          item.request.auth.bearer[0].value = "{{accessToken}}";
        }
      }
    }
  }
}

traverse(data.item);

fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
console.log('Restored variables and fixed references.');
