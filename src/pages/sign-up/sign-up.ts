import { userApi } from '#api'
import { AuthResponse } from '@supabase/supabase-js'
import { Path, redirectIfSignedIn } from '#utils'

window.addEventListener('DOMContentLoaded', () => void redirectIfSignedIn())

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

/**
 * The below is for sign up
 */
const signUpBtn = document.getElementById('submit-button') as HTMLButtonElement
const signUpForm = document.getElementById('signup-form') as HTMLFormElement

async function signUpHandler(ev: MouseEvent): Promise<AuthResponse | void> {
    ev.preventDefault()

    const email = (signUpForm.querySelector('input[name=email]') as HTMLInputElement).value
    const password = (signUpForm.querySelector('input[name=password]') as HTMLInputElement).value
    const firstName = (signUpForm.querySelector('input[name=firstName]') as HTMLInputElement).value
    const lastName = (signUpForm.querySelector('input[name=lastName]') as HTMLInputElement).value

    if (
        typeof email !== 'string' ||
        email.length < 1 ||
        typeof password !== 'string' ||
        password.length < 1 ||
        typeof firstName !== 'string' ||
        firstName.length < 1 ||
        typeof lastName !== 'string' ||
        lastName.length < 1
    ) {
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
            // user could be created
            return
        }

        // if signup succeeded redirect to "check the email" page.
        // TO FIX: the destination path below is just for sample
        window.location.href = Path.signIn
    } catch (err) {
        // TO DO: error handling
        console.error(err)
    }
}

signUpBtn?.addEventListener('click', e => void signUpHandler(e))
