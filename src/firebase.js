import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkLtC4jVXvBqfF2_9x57JTuF2F1mOVWiA",
  authDomain: "my-assistants-72de6.firebaseapp.com",
  projectId: "my-assistants-72de6",
  storageBucket: "my-assistants-72de6.firebasestorage.app",
  messagingSenderId: "945083121765",
  appId: "1:945083121765:web:3a422ffe731d2d3879468c",
  measurementId: "G-P2DGCBEQJP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/** Kept for AuthContext compatibility — real seeding lives in demoStore */
export async function seedInitialData() {
  const { ensureDemoSeeded } = await import('./demoStore');
  await ensureDemoSeeded();
}
