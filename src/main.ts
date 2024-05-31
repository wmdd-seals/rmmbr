import { firebaseApp } from './helpers/firebase.js'

import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firestore = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

console.log({ firestore, auth })
