import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const citiesData = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro', 'Bomdila', 'Tezu', 'Aalo'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Ara', 'Begusarai'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Raigarh', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Calangute', 'Baga'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak', 'Karnal', 'Hisar', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Mandi', 'Solan', 'Dalhousie', 'Palampur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Shimoga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kottayam'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur'],
  'Manipur': ['Imphal', 'Churachandpur', 'Thoubal', 'Bishnupur', 'Ukhrul', 'Kakching', 'Senapati'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Williamnagar'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Geyzing', 'Pelling', 'Ravangla'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Siddipet'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Noida', 'Prayagraj', 'Meerut', 'Aligarh'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh', 'Kashipur', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Burdwan', 'Darjeeling'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Sopore', 'Poonch'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Oulgaret', 'Karaikal', 'Mahe', 'Yanam'],
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Lakshadweep': ['Kavaratti', 'Minicoy', 'Agatti', 'Amini'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Ladakh': ['Leh', 'Kargil']
};

async function seedCities() {
  console.log('🌱 Seeding extensive Indian cities for ALL states...');

  const states = await prisma.masterState.findMany();
  
  if (states.length === 0) {
    console.error('❌ No states found in the database. Run seed.js first.');
    return;
  }

  let totalCities = 0;
  let statesProcessed = 0;

  for (const stateName of Object.keys(citiesData)) {
    // Try exact or partial match
    const stateRecord = states.find(s => 
      s.name.toLowerCase() === stateName.toLowerCase() || 
      s.name.toLowerCase().includes(stateName.toLowerCase())
    );
    
    if (stateRecord) {
      statesProcessed++;
      const cities = citiesData[stateName];
      for (const cityName of cities) {
        await prisma.masterCity.upsert({
          where: { name: cityName },
          update: { stateId: stateRecord.id },
          create: {
            name: cityName,
            stateId: stateRecord.id
          }
        }).catch(async (e) => {
           const exists = await prisma.masterCity.findFirst({ where: { name: cityName, stateId: stateRecord.id } });
           if (!exists) {
             await prisma.masterCity.create({ data: { name: cityName, stateId: stateRecord.id } });
           }
        });
        totalCities++;
      }
      console.log(`✅ Seeded ${cities.length} cities for ${stateRecord.name}`);
    } else {
      console.warn(`⚠️ State not found in DB, skipping: ${stateName}`);
    }
  }

  console.log(`🎉 Successfully seeded ${totalCities} genuine cities across ${statesProcessed} states!`);
}

seedCities()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
