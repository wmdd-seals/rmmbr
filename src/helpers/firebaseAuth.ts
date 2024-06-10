import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth'
import { auth } from './firebase'
import { FirebaseError } from 'firebase/app'
import { addSingleDoc } from './firestore'

/**
 * This function is used for login with using email and password
 */
export async function loginWithEmailAndPassword(email: string, password: string): Promise<User | FirebaseError | void> {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        return user
    } catch (err) {
        if (err instanceof FirebaseError) {
            return err
        }
    }
}

/**
 * This function detects the user's authentication state changes
 * (https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#onauthstatechanged)
 */
export function onAuthChange(callback: (usr: User) => void): void | null {
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
export async function logOutFirebase(): Promise<void> {
    try {
        await signOut(auth)
        // redirect to login page
        window.location.href = '/'
    } catch (err) {
        if (err instanceof FirebaseError) {
            console.log('signout error:', err)
        }
    }
}

/**
 * Sign up new user
 */
export async function signUpFirebase(
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<User | FirebaseError | void> {
    let res
    try {
        // ↓add new user to firebase Authentication
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        res = user

        // ↓login with firebase Authentication
        await loginWithEmailAndPassword(email, password)

        // ↓add new user to firestore
        const newUserObj = {
            email,
            firstName,
            lastName
        }
        if (res) await addSingleDoc('users', newUserObj)
    } catch (err) {
        if (err instanceof FirebaseError) {
            return err
        }
    }

    return res
}
