import { userApi } from '#api'

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

async function login(ev: MouseEvent): Promise<void> {
    ev.preventDefault()
    const form = loginForm
    const data = new FormData(form)
    const email: Exclude<FormDataEntryValue, File> = data.get('email') as string
    const password: Exclude<FormDataEntryValue, File> = data.get('password') as string
    if (email && password) {
        try {
            await userApi.signIn({
                email: email,
                password: password
            })
            // if sign-in succeeded redirect to homepage
            // TO FIX: the path below is just for sample
            window.location.href = '/'
        } catch (err) {
            // error handling
        }
    }
}

loginBtn?.addEventListener('click', e => login(e))
