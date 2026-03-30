// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe9O6f5IZRIioRcPHkrQ5yf0r3gmRRPIQ",
  authDomain: "game-hub-2a85c.firebaseapp.com",
  projectId: "game-hub-2a85c",
  storageBucket: "game-hub-2a85c.firebasestorage.app",
  messagingSenderId: "22467324955",
  appId: "1:22467324955:web:4f9aa6a352f089ab599cbe",
  measurementId: "G-LS3337QHKZ"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
