import {
    AuthError,
    AuthResponse,
    AuthTokenResponsePassword,
    SignUpWithPasswordCredentials
} from '@supabase/supabase-js'
import { supabase } from './supabase'

type SignUpUserCredential = {
    email: string
    password: string
    firstName: string
    lastName: string
}

type SignInUserCredential = {
    email: string
    password: string
}

class UserApi {
    public signUp(userCredential: SignUpUserCredential): Promise<AuthResponse> {
        const loginCred: SignUpWithPasswordCredentials = {
            email: userCredential.email,
            password: userCredential.password,
            options: {
                data: {
                    firstName: userCredential.firstName,
                    lastName: userCredential.lastName
                }
            }
        }
        return supabase.auth.signUp(loginCred)
    }

    public signIn(userCredential: SignInUserCredential): Promise<AuthTokenResponsePassword> {
        return supabase.auth.signInWithPassword(userCredential)
    }

    public signOut(): Promise<{ error: AuthError | null }> {
        return supabase.auth.signOut()
    }
}

export const userApi = new UserApi()
