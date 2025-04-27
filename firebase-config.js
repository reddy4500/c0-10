// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlKfGXZUjHb7NaAt3T945xUSa-9r8y0Vk",
  authDomain: "co-doctor-e0de4.firebaseapp.com",
  databaseURL: "https://co-doctor-e0de4-default-rtdb.firebaseio.com",
  projectId: "co-doctor-e0de4",
  storageBucket: "co-doctor-e0de4.appspot.com", // FIXED
  messagingSenderId: "278726853369",
  appId: "1:278726853369:web:939390176e5585bc04d828",
  measurementId: "G-47XZBZ80VL"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
