
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useRegions = () => {
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      const querySnapshot = await getDocs(collection(db, 'regions'));
      const regionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegions(regionsData);
    };
    fetchRegions();
  }, []);

  return { regions };
};

export const useDistricts = (regionId: string) => {
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      const q = query(collection(db, 'districts'), where('regionId', '==', regionId));
      const querySnapshot = await getDocs(q);
      const districtsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDistricts(districtsData);
    };
    fetchDistricts();
  }, [regionId]);

  return { districts };
};
