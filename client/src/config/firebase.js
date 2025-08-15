import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqkAPxRCZBbQRIzvXexZnv4V_BmabO5mM",
  authDomain: "mood-journal-da3bb.firebaseapp.com",
  projectId: "mood-journal-da3bb",
  storageBucket: "mood-journal-da3bb.firebasestorage.app",
  messagingSenderId: "864748686234",
  appId: "1:864748686234:web:af1d09289c013f08d54823",
  measurementId: "G-ME0FM65YMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
