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
import { storageApi } from './storageApi'

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

                console.log(user)
                console.log(userResponse)
                console.log(userResponse.data?.[0])

                return userResponse.data?.[0]
            },
            () => null
        )
    }

    public async uploadAvatar(userId: User['id'], file: File): Promise<boolean> {
        const res = await storageApi.overwriteFile(`${userId}/avatar`, file)
        console.log(res)
        return !res.error
    }

    public deleteAvatar(userId: User['id']): Promise<boolean> {
        return storageApi.deleteFile(`${userId}/avatar`)
    }

    public async updateName(
        userId: User['id'],

        nameData: { firstName?: User['firstName']; lastName?: User['lastName'] }
    ): Promise<boolean> {
        const res = await supabase.from('users').update(nameData).eq('id', userId)
        return !res.error
    }

    public getAvatarUrl(userId: User['id'], avatarImg: HTMLImageElement, deleteImageBtn: HTMLElement): void {
        const avatarUrl = storageApi.getFileUrl(`${userId}/avatar`) + '?t=' + new Date().getTime()
        if (!avatarUrl) {
            return
        }
        avatarImg.src = avatarUrl
        deleteImageBtn.textContent = 'Delete Icon'
    }
}

export const userApi = new UserApi()
