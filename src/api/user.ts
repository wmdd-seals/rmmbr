import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { auth } from '../helpers/firebase'
import { FirebaseError } from 'firebase/app'

type loginCred = {
    email: string
    password: string
}

class UserApi {
    private _currentUser: User | null
    constructor(private _auth: typeof auth) {
        this._currentUser = _auth.currentUser
        this._auth = _auth
    }

    // getter
    get currentUser(): User | null {
        return this._currentUser
    }

    async signUp(loginCred: loginCred): Promise<void | FirebaseError> {
        const { user } = await createUserWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
        this._currentUser = user
    }

    async signOut(): Promise<void> {
        await signOut(this._auth)
        this._currentUser = null
        return
    }

    async signIn(loginCred: loginCred): Promise<void> {
        const { user } = await signInWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
        this._currentUser = user
    }
}

export const user = new UserApi(auth)
