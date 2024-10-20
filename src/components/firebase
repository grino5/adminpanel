// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Importar Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCe59GQsX8UYiS9qXgFEHLhzp2rJ4lfWf0",
  authDomain: "conectabot-23fe5.firebaseapp.com",
  projectId: "conectabot-23fe5",
  storageBucket: "conectabot-23fe5.appspot.com",
  messagingSenderId: "415432610654",
  appId: "1:415432610654:web:2f185271a861c8304f35cf",
  measurementId: "G-LEBCRES22E"
};

// Inicializa Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);  // Inicializar Firebase Storage

// Exportamos Firestore y Storage
export { db, storage };
