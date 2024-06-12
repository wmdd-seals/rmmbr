import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from '../helpers/firebase'
import { FirebaseError } from 'firebase/app'

type loginCred = {
    email: string
    password: string
}

class Auth {
    private _currentUser: User | null
    constructor(private _auth: typeof auth) {
        this._currentUser = _auth.currentUser
        this._auth = _auth
    }

    // getter
    get currentUser(): User | null {
        return this._currentUser
    }

    async signUpwithEmailAndPassword(loginCred: loginCred): Promise<void | FirebaseError> {
        try {
            const { user } = await createUserWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
            this._currentUser = user
        } catch (err) {
            return err as FirebaseError
        }
    }

    async logoutFirebase(): Promise<void | FirebaseError> {
        try {
            await signOut(this._auth)
            this._currentUser = null
            return
        } catch (err) {
            return err as FirebaseError
        }
    }

    async loginWithEmailAndPassword(loginCred: loginCred): Promise<void | FirebaseError> {
        try {
            const { user } = await signInWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
            this._currentUser = user
        } catch (err) {
            return err as FirebaseError
        }
    }
}

export const account = new Auth(auth)
