// studious/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCs0Ft_0Zx9205ukyZutIkAovGyK7D0Z9M",
  authDomain: "studious-f55cc.firebaseapp.com",
  projectId: "studious-f55cc",
  storageBucket: "studious-f55cc.firebasestorage.app",
  messagingSenderId: "313599142460",
  appId: "1:313599142460:web:7ae7b1c357d9b6bb51f139",
  measurementId: "G-13HX1JBKPK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;