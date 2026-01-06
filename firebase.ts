
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrS5LQ04PWFIR_I4SyySLtpcZj-VlTTz0",
  authDomain: "jpssteel6-f72db.firebaseapp.com",
  projectId: "jpssteel6-f72db",
  storageBucket: "jpssteel6-f72db.firebasestorage.app",
  messagingSenderId: "584507480356",
  appId: "1:584507480356:web:ae0c074eeeb4c34b773bb1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
