const passInput1: HTMLInputElement = document.getElementById('firstPass') as HTMLInputElement
const passInput2: HTMLInputElement = document.getElementById('secondPass') as HTMLInputElement
const passInputs: HTMLInputElement[] = [passInput1, passInput2]

const openEye1: HTMLElement = document.getElementById('openEye1') as HTMLElement
const openEye2: HTMLElement = document.getElementById('openEye2') as HTMLElement
const openEyes: HTMLElement[] = [openEye1, openEye2]

const closedEye1: HTMLElement = document.getElementById('closedEye1') as HTMLElement
const closedEye2: HTMLElement = document.getElementById('closedEye2') as HTMLElement
const closedEyes: HTMLElement[] = [closedEye1, closedEye2]

function makePassVisible(openEye: HTMLElement, index: number): void {
    const passInput = passInputs[index]
    const closedEye = closedEyes[index]

    if (passInput.type === 'password') {
        passInput.type = 'text'
    } else {
        passInput.type = 'password'
    }

    openEye.parentElement?.classList.add('hidden')
    closedEye.parentElement?.classList.remove('hidden')
}

openEyes.forEach((openEye: HTMLElement, index: number) => {
    openEye.addEventListener('click', () => makePassVisible(openEye, index))
})

function makePassInvisible(closedEye: HTMLElement, index: number): void {
    const passInput = passInputs[index]
    const openEye = openEyes[index]

    if (passInput.type === 'text') {
        passInput.type = 'password'
    } else {
        passInput.type = 'text'
    }

    closedEye.parentElement?.classList.add('hidden')
    openEye.parentElement?.classList.remove('hidden')
}
closedEyes.forEach((closedEye: HTMLElement, index: number) =>
    closedEye.addEventListener('click', () => makePassInvisible(closedEye, index))
)

passInput2.addEventListener('input', () => {
    const firstPass: string = passInput1.value
    const secondPass: string = passInput2.value

    if (firstPass === secondPass) {
        passInput2.setCustomValidity('')
    } else {
        passInput2.setCustomValidity('Passwords do not match.')
    }
})
