
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlKfGXZUjHb7NaAt3T945xUSa-9r8y0Vk",
  authDomain: "co-doctor-e0de4.firebaseapp.com",
  databaseURL: "https://co-doctor-e0de4-default-rtdb.firebaseio.com",
  projectId: "co-doctor-e0de4",
  storageBucket: "co-doctor-e0de4.firebasestorage.app",
  messagingSenderId: "278726853369",
  appId: "1:278726853369:web:939390176e5585bc04d828",
  measurementId: "G-47XZBZ80VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
