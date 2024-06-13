import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth } from 'firebase/auth'
import { auth } from '../helpers/firebase'
import { FirebaseError } from 'firebase/app'

type LoginCred = {
    email: string
    password: string
}

class UserApi {
    constructor(private _auth: Auth) {
        this._auth = _auth
    }

    async signUp(loginCred: LoginCred): Promise<void | FirebaseError> {
        await createUserWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
    }

    async signOut(): Promise<void> {
        await signOut(this._auth)
    }

    async signIn(loginCred: LoginCred): Promise<void> {
        await signInWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
    }
}

export const userApi = new UserApi(auth)
