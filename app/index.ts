import { firebaseApp } from './helpers/firebase.js'

import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js'

const firestore = getFirestore(firebaseApp)

console.log({ firestore })
