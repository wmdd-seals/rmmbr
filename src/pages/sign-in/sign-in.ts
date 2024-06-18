import { SignInUserCredential } from './../../api/userApi'
import { userApi } from '#api'
import { isTruthyString } from '#utils'
import { AuthTokenResponsePassword } from '@supabase/supabase-js'
import { supabase } from 'src/helpers/supabase'

const passwordInput = document.getElementById('password') as HTMLInputElement
const eye = document.getElementById('eye')!

function togglePasswordVisibility(e: MouseEvent): void {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password'
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye')
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye-slash')
}

eye.addEventListener('click', e => togglePasswordVisibility(e))

/**
 * The below is for sign-in
 */
const signInForm = document.getElementById('signin-form') as HTMLFormElement
const signInBtn = document.getElementById('signin-btn') as HTMLButtonElement

async function loginHandler(ev: MouseEvent): Promise<AuthTokenResponsePassword | void> {
    ev.preventDefault()
    const userCred = {
        email: (signInForm.querySelector('input[name=email]') as HTMLInputElement).value,
        password: (signInForm.querySelector('input[name=password]') as HTMLInputElement).value
    }

    try {
        if (Object.keys(userCred).every(k => isTruthyString(userCred[k as keyof SignInUserCredential])))
            await userApi.signIn(userCred)
        // if sign-in succeeded redirect to homepage
        // TO FIX: the destination path below is just for sample
        window.location.href = '/'
    } catch (err) {
        // TO DO: error handling
        console.error(err)
    }
}

signInBtn?.addEventListener('click', e => void loginHandler(e))
