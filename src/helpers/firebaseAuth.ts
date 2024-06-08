import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from './firebase'

/**
 * This function is used for login with using email and password
 * @param {string} email
 * @param {string} password
 */
const loginWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
    let result = null
    await signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // Signed in
            const user = userCredential.user
            result = user
        })
        .catch(error => {
            // const errorCode = error.code
            // const errorMessage = error.message
            // const error
            // TO DO: error handling
        })
    return result
}

/**
 * This function detects the user's authentication state changes
 * (https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#onauthstatechanged)
 * @param {CallbackName} callback
 */
const onAuthChange = (callback: (usr: User) => void): void | null => {
    onAuthStateChanged(auth, usr => {
        if (usr) {
            // user is signed in
            callback(usr)
        } else {
            // user is signed out
            // redirect to login page
        }
    })
}

/**
 * This function let the user sign out
 */
const logOutFirebase = (): void => {
    signOut(auth)
        .then(() => {
            // redirect to login page
            window.location.href = '/'
        })
        .catch(err => {
            //
            throw new Error(err)
        })
}

export { loginWithEmailAndPassword, onAuthChange, logOutFirebase }
