const passwordInput: HTMLInputElement = document.getElementById('password') as HTMLInputElement
const openEye: HTMLElement = document.getElementById('openEye') as HTMLElement
const closedEye: HTMLElement = document.getElementById('closedEye') as HTMLElement

function togglePassVisibilityOpenEye(): void {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
    } else {
        passwordInput.type = 'password'
    }

    openEye.parentElement?.classList.add('hidden')
    closedEye.parentElement?.classList.remove('hidden')
}

openEye.addEventListener('click', togglePassVisibilityOpenEye)

function togglePassVisibilityClosedEye(): void {
    if (passwordInput.type === 'text') {
        passwordInput.type = 'password'
    } else {
        passwordInput.type = 'text'
    }
    closedEye.parentElement?.classList.add('hidden')
    openEye.parentElement?.classList.remove('hidden')
}

closedEye.addEventListener('click', togglePassVisibilityClosedEye)
