import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
interface FirebaesConfig {
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

/* Narrowing the type of each properties below */
// Japanese article for narrowing(https://zenn.dev/estra/articles/typescript-narrowing)
// English article for narrowing(https://medium.com/@hrishikesh.pandey9955/what-is-narrowing-in-typescript-047b4c450de4)
const firebaseConfig: FirebaesConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env?.VITE_FIREBASE_PRO_JECTID ?? '',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDERID ?? '',
    appId: import.meta.env?.VITE_FIREBASE_APP_I ?? ''
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize firestore SDK
const firestore = getFirestore(firebaseApp)
// Initialize Authentication SDK
const auth = getAuth(firebaseApp)

export { firebaseApp, firestore, auth }
