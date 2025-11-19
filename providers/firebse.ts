import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB2ouuOTTPL5P5sIHlQK3ax1eKMgykPPbk",
  authDomain: "campus-56523.firebaseapp.com",
  projectId: "campus-56523",
  storageBucket: "campus-56523.firebasestorage.app",
  messagingSenderId: "490275982574",
  appId: "1:490275982574:web:3293d49eabc72f11f337ff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
