import fs from 'fs';

const filePath = 'd:/investors-world-realty/server/postman/IWR_Mobile_App.postman_collection.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Find "Documents" folder
const docsFolder = data.item.find(i => i.name.includes('Documents'));
if (docsFolder) {
  const welcomeLetterReq = docsFolder.item.find(i => i.name.includes('Welcome Letter'));
  if (welcomeLetterReq) {
    welcomeLetterReq.name = "Get Welcome Letter Data";
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Postman collection updated successfully');
