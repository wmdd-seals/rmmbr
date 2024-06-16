import { supabase } from '../helpers/supabase'

type signUpUserCredential = {
    email: string
    password: string
    options: {
        data: {
            firstName: string
            lastName: string
        }
    }
}

type signInUserCredential = {
    email: string
    password: string
}

class UserApi {
    async signUp(userCredential: signUpUserCredential): Promise<void> {
        await supabase.auth.signUp(userCredential)
    }

    async signIn(userCredential: signInUserCredential): Promise<void> {
        await supabase.auth.signInWithPassword(userCredential)
    }

    async signOut(): Promise<void> {
        await supabase.auth.signOut()
    }
}

export const userApi = new UserApi()
