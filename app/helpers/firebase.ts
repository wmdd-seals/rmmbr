// This way of importing module did not work in the node.js environment which means we can not test it.
// This works in browser
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'

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

const firebaseConfig: FirebaesConfig = {
    apiKey: '', // get env(the env info will be referenced from Firebase admin)
    authDomain: '', // get env(the env info will be referenced from Firebase admin)
    projectId: '', // get env(the env info will be referenced from Firebase admin)
    storageBucket: '', // get env(the env info will be referenced from Firebase admin)
    messagingSenderId: '', // get env(the env info will be referenced from Firebase admin)
    appId: '' // get env(the env info will be referenced from Firebase admin)
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

export { firebaseApp }
