import { initializeApp } from 'firebase/app'
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

// narrowing the type of each properties below
// Japanese article for narrowing(https://zenn.dev/estra/articles/typescript-narrowing)
// English article for narrowing(https://medium.com/@hrishikesh.pandey9955/what-is-narrowing-in-typescript-047b4c450de4)
const firebaseConfig: FirebaesConfig = {
    apiKey: import.meta.env?.FIREBASE_APIKEY ?? '',
    authDomain: import.meta.env?.FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env?.FIREBASE_PRO_JECTID ?? '',
    storageBucket: import.meta.env?.FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env?.FIREBASE_MESSAGING_SENDERID ?? '',
    appId: import.meta.env?.FIREBASE_APP_I ?? ''
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

export { firebaseApp }
