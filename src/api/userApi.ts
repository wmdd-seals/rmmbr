import {
    AuthError,
    AuthResponse,
    AuthTokenResponsePassword,
    SignUpWithPasswordCredentials
} from '@supabase/supabase-js'
import { supabase } from './supabase'
import { User } from '#domain'
import { storageApi } from './storageApi'
import { PromiseMaybe } from '#utils'
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
                const sessionUser = res.data.user
                if (!sessionUser) return null

                const userResponse = await supabase
                    .from(ApiTable.Users)
                    .select<'*', User>('*')
                    .eq('id' satisfies keyof User, sessionUser.id)

                const user = userResponse.data?.[0]

                if (!user) return null

                return {
                    ...user,
                    avatarSrc: storageApi.getFileUrl(this.constructAvatarPath(user.id))
                }
            },
            () => null
        )
    }

    public async uploadAvatar(userId: User['id'], file: File): Promise<boolean> {
        const res = await storageApi.overwriteFile(this.constructAvatarPath(userId), file)

        return !res.error
    }

    public deleteAvatar(userId: User['id']): Promise<boolean> {
        return storageApi.deleteFile(this.constructAvatarPath(userId))
    }

    public async update(
        userId: User['id'],
        payload: Partial<Pick<User, 'firstName' | 'lastName'>>
    ): PromiseMaybe<User> {
        const res = await supabase
            .from(ApiTable.Users)
            .update<typeof payload>(payload)
            .eq('id' satisfies keyof User, userId)
            .select<'*', User>('*')

        return res.data?.[0]
    }

    private constructAvatarPath(userId: User['id']): string {
        return `user/${userId}/avatar`
    }

    public async findUser({
        key,
        value
    }: { key: 'email'; value: User['email'] } | { key: 'id'; value: User['id'] }): PromiseMaybe<User> {
        const res = await supabase.from(ApiTable.Users).select<string, User>('*').eq(key, value)
        return res.data?.[0]
    }
}

export const userApi = new UserApi()
