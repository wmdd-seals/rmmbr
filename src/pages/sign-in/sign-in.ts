import { userApi } from '#api'
import { AuthTokenResponsePassword } from '@supabase/supabase-js'

const passwordInput = document.getElementById('password') as HTMLInputElement
const eye = document.getElementById('eye')!

function togglePasswordVisibility(e: MouseEvent): void {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password'
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye')
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye-slash')
}

eye.addEventListener('click', e => togglePasswordVisibility(e))

// login
const loginForm = document.getElementById('signin-form') as HTMLFormElement
const loginBtn = document.getElementById('signin-btn') as HTMLButtonElement

function loginHandler(ev: MouseEvent): Promise<AuthTokenResponsePassword> | void {
    ev.preventDefault()
    const form = loginForm
    const data = new FormData(form)
    const email: Exclude<FormDataEntryValue, File> = data.get('email') as string
    const password: Exclude<FormDataEntryValue, File> = data.get('password') as string
    if (email && password) {
        return userApi.signIn({
            email: email,
            password: password
        })
    }
}

loginBtn?.addEventListener('click', e => {
    void (async (): Promise<void> => {
        try {
            await loginHandler(e)
            // if sign-in succeeded redirect to homepage
            // TO FIX: the destination path below is just for sample
            window.location.href = '/'
        } catch (err) {
            // TO DO: error handling
            console.error(err)
        }
    })()
})
