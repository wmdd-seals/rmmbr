import { supabase } from '../helpers/supabase'

type signUpOptions = {
    data: {
        firstName: string
        lastName: string
    }
}

type signUpUserCredential = {
    email: string
    password: string
    options: signUpOptions
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
