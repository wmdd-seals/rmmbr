import {
    AuthError,
    AuthResponse,
    AuthTokenResponsePassword,
    SignUpWithPasswordCredentials
} from '@supabase/supabase-js'
import { supabase } from './supabase'
import { PromiseMaybe } from '#utils'
import { User } from '#domain'
import { ApiTable } from './utils'

export type SignUpUserCredential = {
    email: string
    password: string
    firstName: string
    lastName: string
}

export type SignInUserCredential = {
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

    public async getCurrent(): PromiseMaybe<User> {
        return supabase.auth.getUser().then(
            async res => {
                const user = res.data.user
                if (!user) return null

                const userResponse = await supabase
                    .from(ApiTable.Users)
                    .select<'*', User>('*')
                    .eq('id' satisfies keyof User, user.id)

                return userResponse.data?.[0]
            },
            () => null
        )
    }
}

export const userApi = new UserApi()
