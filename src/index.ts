import { firebaseApp } from './helpers/firebase.js'

import { getFirestore } from 'firebase/firestore'

const firestore = getFirestore(firebaseApp)

console.log({ firestore })
