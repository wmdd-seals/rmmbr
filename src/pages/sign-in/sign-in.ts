import { userApi } from '#api'
import { AuthTokenResponsePassword } from '@supabase/supabase-js'
import { Path, redirectIfSignedIn } from '#utils'

window.addEventListener('DOMContentLoaded', () => void redirectIfSignedIn())

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
    const email = (signInForm.querySelector('input[name=email]') as HTMLInputElement).value
    const password = (signInForm.querySelector('input[name=password]') as HTMLInputElement).value

    if (typeof email !== 'string' || email.length < 1 || typeof password !== 'string' || password.length < 1) {
        return
    }

    try {
        const { data } = await userApi.signIn({
            email: email,
            password: password
        })

        if (!data.user) {
            // sign-in failed
            return
        }

        // if sign-in succeeded redirect to homepage
        // TO FIX: the destination path below is just for sample
        window.location.href = Path.memory
    } catch (err) {
        // TO DO: error handling
        console.error(err)
    }
}

signInBtn?.addEventListener('click', e => void loginHandler(e))
