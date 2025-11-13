// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC35N7wjhqU419UAmeemcnFA0LTC3uxUmA",
  authDomain: "dotted-carrier-461908-s2.firebaseapp.com",
  projectId: "dotted-carrier-461908-s2",
  storageBucket: "dotted-carrier-461908-s2.firebasestorage.app",
  messagingSenderId: "1003647750431",
  appId: "1:1003647750431:web:e3f32124165e5d6386202a",
  measurementId: "G-TN0E6XMDSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };