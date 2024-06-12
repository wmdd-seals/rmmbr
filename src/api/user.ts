import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, Auth } from 'firebase/auth'
import { auth } from '../helpers/firebase'
import { FirebaseError } from 'firebase/app'

type LoginCred = {
    email: string
    password: string
}

type Options = {
    onSuccess?: () => void
}

class UserApi {
    constructor(private _auth: Auth) {
        this._auth = _auth
    }

    async signUp(loginCred: LoginCred, options?: Options): Promise<void | FirebaseError> {
        await createUserWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
        if (options && options.onSuccess) {
            options.onSuccess()
        }
    }

    async signOut(options?: Options): Promise<void> {
        await signOut(this._auth)
        if (options && options.onSuccess) {
            options.onSuccess()
        }
    }

    async signIn(loginCred: LoginCred, options?: Options): Promise<void> {
        await signInWithEmailAndPassword(this._auth, loginCred.email, loginCred.password)
        if (options && options.onSuccess) {
            options.onSuccess()
        }
    }
}

export const userApi = new UserApi(auth)
