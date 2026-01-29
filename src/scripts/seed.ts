import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import { tanzanianRegions } from '../lib/regions';

const seedRegions = async () => {
  const regionsCollectionRef = collection(db, 'regions');
  
  console.log('Starting to seed regions...');

  for (const regionName of tanzanianRegions) {
    try {
      await addDoc(regionsCollectionRef, {
        name: regionName,
        createdAt: Timestamp.now(),
      });
      console.log(`Added region: ${regionName}`);
    } catch (error) {
      console.error(`Error adding region ${regionName}:`, error);
    }
  }

  console.log('Finished seeding regions.');
};

seedRegions();
