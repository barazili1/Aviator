
import { ref, set, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import { HistoryItem } from '../types';

export const firebaseService = {
  syncHistory: (history: HistoryItem[]) => {
    const historyRef = ref(db, 'history');
    return set(historyRef, history);
  },

  onHistoryChange: (callback: (history: HistoryItem[]) => void) => {
    const historyRef = ref(db, 'history');
    return onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
  },

  addHistoryItem: (item: HistoryItem) => {
    const historyRef = ref(db, 'history');
    const newItemRef = push(historyRef);
    return set(newItemRef, item);
  }
};
