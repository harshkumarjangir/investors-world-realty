/**
 * Seed MasterCity with major Indian cities per state.
 * Run: node prisma/seed-cities.mjs
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const CITIES_BY_STATE = {
  'Andhra Pradesh':     ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Kadapa','Kakinada','Rajahmundry','Anantapur'],
  'Arunachal Pradesh':  ['Itanagar','Naharlagun','Pasighat','Tezpur','Bomdila'],
  'Assam':              ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Bongaigaon','Dhubri'],
  'Bihar':              ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Bihar Sharif','Arrah','Begusarai','Katihar'],
  'Chhattisgarh':       ['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon','Jagdalpur','Ambikapur'],
  'Goa':                ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim'],
  'Gujarat':            ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Navsari'],
  'Haryana':            ['Faridabad','Gurgaon','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula'],
  'Himachal Pradesh':   ['Shimla','Dharamshala','Solan','Manali','Mandi','Baddi','Kullu','Hamirpur'],
  'Jharkhand':          ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih','Ramgarh'],
  'Karnataka':          ['Bengaluru','Mysuru','Hubli','Mangaluru','Belgaum','Gulbarga','Davanagere','Ballari','Shimoga','Tumkur'],
  'Kerala':             ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Palakkad','Alappuzha','Kannur','Kottayam','Malappuram'],
  'Madhya Pradesh':     ['Indore','Bhopal','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa'],
  'Maharashtra':        ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Amravati','Kolhapur','Thane','Navi Mumbai','Pimpri-Chinchwad'],
  'Manipur':            ['Imphal','Thoubal','Bishnupur','Churachandpur'],
  'Meghalaya':          ['Shillong','Tura','Jowai','Nongpoh'],
  'Mizoram':            ['Aizawl','Lunglei','Champhai'],
  'Nagaland':           ['Kohima','Dimapur','Mokokchung'],
  'Odisha':             ['Bhubaneswar','Cuttack','Rourkela','Berhampur','Sambalpur','Puri','Balasore','Bhadrak'],
  'Punjab':             ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Firozpur','Hoshiarpur','Pathankot'],
  'Rajasthan':          ['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Bharatpur','Sikar','Tonk','Churu','Nagaur','Barmer','Jhalawar','Chaksu'],
  'Sikkim':             ['Gangtok','Namchi','Mangan'],
  'Tamil Nadu':         ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Erode','Vellore','Tiruppur','Thoothukudi'],
  'Telangana':          ['Hyderabad','Warangal','Nizamabad','Khammam','Karimnagar','Ramagundam','Secunderabad','Mahbubnagar'],
  'Tripura':            ['Agartala','Dharmanagar','Udaipur','Kailasahar'],
  'Uttar Pradesh':      ['Lucknow','Kanpur','Ghaziabad','Agra','Varanasi','Meerut','Prayagraj','Bareilly','Aligarh','Moradabad','Noida','Firozabad','Jhansi','Mathura','Saharanpur'],
  'Uttarakhand':        ['Dehradun','Haridwar','Roorkee','Haldwani','Rishikesh','Kashipur','Rudrapur','Nainital'],
  'West Bengal':        ['Kolkata','Howrah','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Baharampur','Kharagpur','Haldia'],
  'Delhi':              ['New Delhi','Central Delhi','North Delhi','South Delhi','East Delhi','West Delhi','Dwarka','Rohini','Pitampura','Laxmi Nagar'],
  'Jammu and Kashmir':  ['Srinagar','Jammu','Anantnag','Sopore','Baramulla','Udhampur','Kathua'],
  'Ladakh':             ['Leh','Kargil'],
};

async function main() {
  console.log('🌱 Seeding cities...');

  // Get all states from DB
  const states = await prisma.masterState.findMany({ select: { id: true, name: true } });
  const stateMap = new Map(states.map((s) => [s.name, s.id]));

  let total = 0;

  for (const [stateName, cities] of Object.entries(CITIES_BY_STATE)) {
    const stateId = stateMap.get(stateName);
    if (!stateId) {
      console.warn(`  ⚠ State not found: ${stateName}`);
      continue;
    }

    // Check existing cities for this state to avoid duplicates
    const existing = await prisma.masterCity.findMany({
      where: { stateId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((c) => c.name));

    const toInsert = cities.filter((c) => !existingNames.has(c));
    if (toInsert.length > 0) {
      await prisma.masterCity.createMany({
        data: toInsert.map((name) => ({ name, stateId })),
      });
      total += toInsert.length;
    }
  }

  console.log(`✅ Seeded ${total} cities across ${Object.keys(CITIES_BY_STATE).length} states`);

  const finalCount = await prisma.masterCity.count();
  console.log(`📊 Total cities in DB: ${finalCount}`);
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
