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
