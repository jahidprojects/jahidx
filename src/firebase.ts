import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0xpYdKIzNrjVZv4bATf8Wk5t19a1ZhYI",
  authDomain: "giftphasenew.firebaseapp.com",
  projectId: "giftphasenew",
  storageBucket: "giftphasenew.firebasestorage.app",
  messagingSenderId: "624085954653",
  appId: "1:624085954653:web:13f29ee67234c2493e5db4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
