import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcpiUxhXyvzmhaPQK2_0Zwur-8gRh5qEc",
  authDomain: "roktochai.firebaseapp.com",
  projectId: "roktochai",
  storageBucket: "roktochai.firebasestorage.app",
  messagingSenderId: "1031098651879",
  appId: "1:1031098651879:web:146c0298c90eec24cc7e42",
  measurementId: "G-1Z08L397EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
