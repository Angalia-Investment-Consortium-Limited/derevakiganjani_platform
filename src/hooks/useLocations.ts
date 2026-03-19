
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useRegions = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'regions'));
        const regionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegions(regionsData);
      } catch (error) {
        console.error("Error fetching regions: ", error);
      }
      setIsLoading(false);
    };
    fetchRegions();
  }, []);

  return { regions, isLoading };
};

export const useDistricts = (regionId: string) => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'districts'), where('regionId', '==', regionId));
        const querySnapshot = await getDocs(q);
        const districtsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDistricts(districtsData);
      } catch (error) {
        console.error("Error fetching districts: ", error);
      }
      setIsLoading(false);
    };
    fetchDistricts();
  }, [regionId]);

  return { districts, isLoading };
};
