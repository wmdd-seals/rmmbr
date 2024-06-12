import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from '../helpers/firebase'
import { FirebaseError } from 'firebase/app'

console.log(auth)

type loginCred = {
    email: string
    password: string
}

class Auth {
    constructor(private _currentUser: User | null) {
        this._currentUser = _currentUser
    }

    // getter
    get currentUser(): User | null {
        return this._currentUser
    }

    async signUpwithEmailAndPassword(loginCred: loginCred): Promise<void | FirebaseError> {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, loginCred.email, loginCred.password)
            this._currentUser = user
        } catch (err) {
            return err as FirebaseError
        }
    }

    async logoutFirebase(): Promise<void | FirebaseError> {
        try {
            await signOut(auth)
            this._currentUser = null
            return
        } catch (err) {
            return err as FirebaseError
        }
    }

    async loginWithEmailAndPassword(loginCred: loginCred): Promise<void | FirebaseError> {
        try {
            const { user } = await signInWithEmailAndPassword(auth, loginCred.email, loginCred.password)
            this._currentUser = user
        } catch (err) {
            return err as FirebaseError
        }
    }
}

export const account = new Auth(auth.currentUser)
