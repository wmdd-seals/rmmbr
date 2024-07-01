import { supabase, userApi } from '#api'
import { AuthResponse } from '@supabase/supabase-js'
import { PagePath } from '#utils'

async function redirectIfSignedIn(): Promise<void> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
        return
    }

    window.location.href = PagePath.Home
}

void redirectIfSignedIn()

const passwordInput1 = document.getElementById('first-password') as HTMLInputElement
const passwordInput2 = document.getElementById('second-password') as HTMLInputElement
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

const signUpBtn = document.getElementById('signup-btn') as HTMLButtonElement
const signUpForm = document.getElementById('signup-form') as HTMLFormElement

async function signUpHandler(ev: MouseEvent): Promise<AuthResponse | void> {
    ev.preventDefault()

    const email = (signUpForm.querySelector('input[name=email]') as HTMLInputElement).value
    const password = (signUpForm.querySelector('input[name=firstPassword]') as HTMLInputElement).value
    const firstName = (signUpForm.querySelector('input[name=firstName]') as HTMLInputElement).value
    const lastName = (signUpForm.querySelector('input[name=lastName]') as HTMLInputElement).value

    if (email.length < 1 || password.length < 1 || firstName.length < 1 || lastName.length < 1) {
        return
    }

    try {
        const { data } = await userApi.signUp({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        })

        if (!data.user) {
            return
        }

        window.location.href = PagePath.SignIn
    } catch (err) {
        console.error(err)
    }
}

signUpBtn.addEventListener('click', signUpHandler)
signUpBtn.addEventListener('click', checkIfPasswordsMatch)
