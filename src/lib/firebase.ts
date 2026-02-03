import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    getCountFromServer,
    orderBy,
    limit,
    doc,
    updateDoc,
} from "firebase/firestore";
import type {
    CollectionReference,
    DocumentData,
    WhereFilterOp,
    OrderByDirection
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const messaging = getMessaging(app);

const employerDocumentsCollection = collection(db, 'employerDocuments');
const licenseApplicationsCollection = collection(db, 'licenseApplications');

const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

const saveDocument = async (employerId: string, documentType: string, fileURL: string) => {
  return await addDoc(employerDocumentsCollection, {
    employerId,
    documentType,
    fileURL,
    status: 'uploaded',
    createdAt: new Date(),
  });
};

const getEmployerDocuments = async (employerId: string) => {
  const q = query(employerDocumentsCollection, where('employerId', '==', employerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

const submitVerification = async (employerId: string) => {
  const documents = await getEmployerDocuments(employerId);
  for (const document of documents) {
    const docRef = doc(db, 'employerDocuments', document.id);
    await updateDoc(docRef, { status: 'pending' });
  }
};

export type Filter = [string, WhereFilterOp, unknown];
export type OrderBy = { field: string; order: OrderByDirection };

const getDocumentCount = async (coll: CollectionReference<DocumentData>, filters?: Filter[]) => {
  let q = query(coll);
  if (filters) {
    for (const filter of filters) {
      q = query(q, where(filter[0], filter[1], filter[2]));
    }
  }
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

const getDocuments = async (
    coll: CollectionReference<DocumentData>,
    { filters, limit: docLimit, orderBy: docOrderBy }: { filters?: Filter[]; limit?: number; orderBy?: OrderBy }
  ) => {
    let q = query(coll);
    if (filters) {
      for (const filter of filters) {
        q = query(q, where(filter[0], filter[1], filter[2]));
      }
    }
    if (docOrderBy) {
      q = query(q, orderBy(docOrderBy.field, docOrderBy.order));
    }
    if (docLimit) {
      q = query(q, limit(docLimit));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};


export { app, auth, storage, db, functions, messaging, uploadFile, saveDocument, getEmployerDocuments, submitVerification, getDocumentCount, getDocuments, licenseApplicationsCollection };