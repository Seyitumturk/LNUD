// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCxUJTyQs_OTaRCGzc3qi6wOZe61t2ASoU",
    authDomain: "lnu-dashboard.firebaseapp.com",
    projectId: "lnu-dashboard",
    storageBucket: "lnu-dashboard.appspot.com",
    messagingSenderId: "329274655916",
    appId: "1:329274655916:web:a6905f46da0fb8b6118b09",
    measurementId: "G-MZN1WEKLM9"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
