import jwt from 'jsonwebtoken';
import config from './src/config/index.js';

// Generate an expired token (expires in -1 seconds)
const token = jwt.sign(
  {
    id: '132afc5d-eff7-4d87-9984-7a1240e453d9', // Suresh Sharma IW100002
    userId: 'IW100002',
    type: 'associate'
  },
  config.JWT_SECRET,
  { expiresIn: '-1s' }
);

console.log('\n--- EXPIRED TOKEN FOR FLUTTER TESTING ---');
console.log(token);
console.log('\nPaste this into the Flutter app or Postman Authorization header.');
console.log('It will instantly return: { "status": "error", "message": "Access token expired", "data": "TOKEN_EXPIRED" }');
