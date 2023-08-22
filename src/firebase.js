import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB70II4YjxcT0NMlu9-Bo2nlKJcgSYGar8",
  authDomain: "cashbook-98503.firebaseapp.com",
  projectId: "cashbook-98503",
  storageBucket: "cashbook-98503.appspot.com",
  messagingSenderId: "118919334257",
  appId: "1:118919334257:web:1b2c046dd526ee30500ed0",
  measurementId: "G-RJ6ES3VB12"
};

// Set persistence for authentication
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Authentication persistence set to NONE");
  })
  .catch((error) => {
    console.error("Error setting authentication persistence:", error);
  });

export { db, auth };
