import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

type FirebaseConfig = {
    apiKey: string
    authDomain: string
    // The value of `databaseURL` depends on the location of the database
    // databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    // For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
    // measurementId: string
}

const firebaseConfig: FirebaseConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID ?? ''
}

// Initialize Firebase
const firebase = initializeApp(firebaseConfig)

// Initialize firestore SDK
const firestore = getFirestore(firebase)
// Initialize Authentication SDK
const auth = getAuth(firebase)

export { firebase, firestore, auth }
