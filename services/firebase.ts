// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBPltUmLN9fO5ZCrt6lxiGFgiwnbHCoFDc",
    authDomain: "apl-kasir.firebaseapp.com",
    projectId: "apl-kasir",
    storageBucket: "apl-kasir.firebasestorage.app",
    messagingSenderId: "4470776182",
    appId: "1:4470776182:web:4a4b22bf4efc659c4e5a57",
    measurementId: "G-R72XTXYRV0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
