import prisma from '../src/utils/prisma.js';
import { getPendingKYC } from '../src/services/admin/kyc.service.js';

async function main() {
  const result = await getPendingKYC({ page: 1, pageSize: 20, skip: 0, take: 20 });
  console.log(JSON.stringify(result.items[0], null, 2));
  process.exit(0);
}
main();
