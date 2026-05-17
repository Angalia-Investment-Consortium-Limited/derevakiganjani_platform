import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid || !user?.roles || user.roles.length === 0) return;

    const userRole = user.roles[0];
    let q;
    if (userRole === 'Driver') {
      q = query(
        collection(db, 'conversations'),
        where('driverId', '==', user.uid),
        where('unreadDriver', '>', 0)
      );
    } else if (userRole === 'Employer') {
      q = query(
        collection(db, 'conversations'),
        where('employerId', '==', user.uid),
        where('unreadEmployer', '>', 0)
      );
    } else {
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        totalUnread += userRole === 'Driver' ? (data.unreadDriver || 0) : (data.unreadEmployer || 0);
      });
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.roles]);

  return unreadCount;
}
