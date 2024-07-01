import { userApi } from '#api'
import { AuthTokenResponsePassword } from '@supabase/supabase-js'
import { PagePath } from '#utils'
import { supabase } from '#api'

async function redirectIfSignedIn(): Promise<void> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
        return
    }

    window.location.href = PagePath.Home
}

void redirectIfSignedIn()

const signInForm = document.getElementById('signin-form') as HTMLFormElement
const signInBtn = document.getElementById('signin-btn') as HTMLButtonElement

async function loginHandler(ev: MouseEvent): Promise<AuthTokenResponsePassword | void> {
    ev.preventDefault()
    const email = (signInForm.querySelector('input[name=email]') as HTMLInputElement).value
    const password = (signInForm.querySelector('input[name=password]') as HTMLInputElement).value

    if (typeof email !== 'string' || email.length < 1 || typeof password !== 'string' || password.length < 1) {
        return
    }
    try {
        signInBtn.disabled = true

        const { data } = await userApi.signIn({
            email: email,
            password: password
        })

        if (!data.user) {
            return
        }
    } finally {
        signInBtn.disabled = false
    }

    window.location.href = PagePath.Home
}

signInBtn.addEventListener('click', loginHandler)
