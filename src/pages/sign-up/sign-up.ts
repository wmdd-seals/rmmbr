import { userApi } from '#api'
import { AuthResponse } from '@supabase/supabase-js'

const passwordInput1 = document.getElementById('first-pass') as HTMLInputElement
const passwordInput2 = document.getElementById('second-pass') as HTMLInputElement
const passwordInputs = [passwordInput1, passwordInput2]

const eye1 = document.getElementById('eye1')!
const eye2 = document.getElementById('eye2')!
const eyes = [eye1, eye2]

function togglePasswordAppearance(input: HTMLInputElement, e: MouseEvent): void {
    input.type = input.type === 'password' ? 'text' : 'password'
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye')
    ;(e.currentTarget as HTMLElement).classList.toggle('fa-eye-slash')
}

eyes.forEach((eye, index) => {
    eye.addEventListener('click', e => togglePasswordAppearance(passwordInputs[index], e))
})

function checkIfPasswordsMatch(e: Event): void {
    e.preventDefault()

    if (passwordInput1.value !== passwordInput2.value) {
        passwordInput2.setCustomValidity('Passwords do not match.')
        passwordInput2.reportValidity()

        return
    }

    passwordInput2.setCustomValidity('')
}

const submitBtn = document.getElementById('submit-button') as HTMLInputElement
submitBtn.addEventListener('click', checkIfPasswordsMatch)

// signup
const signUpBtn = document.getElementById('submit-button') as HTMLButtonElement
const signUpForm = document.getElementById('signup-form') as HTMLFormElement

function signInHandler(ev: MouseEvent): Promise<AuthResponse> | void {
    ev.preventDefault()
    const form = signUpForm
    const data = new FormData(form)
    const email: Exclude<FormDataEntryValue, File> = data.get('email') as string
    const password: Exclude<FormDataEntryValue, File> = data.get('password') as string
    const firstName: Exclude<FormDataEntryValue, File> = data.get('firstName') as string
    const lastName: Exclude<FormDataEntryValue, File> = data.get('lastName') as string
    console.log(email, password, firstName, lastName)
    if (email && password && firstName && lastName) {
        return userApi.signUp({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        })
    }
}

signUpBtn?.addEventListener('click', e => {
    void (async (): Promise<void> => {
        try {
            await signInHandler(e)
            // if signup succeeded redirect to "check the email" page.
            // TO FIX: the destination path below is just for sample
            window.location.href = '/'
        } catch (err) {
            // TO DO: error handling
            console.error(err)
        }
    })()
})
