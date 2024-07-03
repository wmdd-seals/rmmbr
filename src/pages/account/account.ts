import { userApi } from '#api'
import { updateCurrentUserChip } from '#utils'

userApi.getCurrent().then(user => {
    if (!user) return

    const { id, firstName, lastName, email } = user

    const nameDisplay = document.getElementById('name-display')!
    const firstNameInputField = document.getElementById('first-name') as HTMLInputElement
    const lastNameInputField = document.getElementById('last-name') as HTMLInputElement
    const emailInputField = document.getElementById('email') as HTMLInputElement
    const avatarInput = document.getElementById('avatar') as HTMLInputElement

    // nameDisplay.innerHTML = firstName
    firstNameInputField.value = firstName
    lastNameInputField.value = lastName
    emailInputField.value = email

    updateCurrentUserChip(user)

    const saveBtn = document.getElementById('save-btn')!

    saveBtn.addEventListener('click', async () => {
        const newAvatar = avatarInput.files?.[0]

        if (newAvatar) {
            void userApi.uploadAvatar(id, newAvatar)
        }

        const updatedUser = await userApi.update(id, {
            firstName: firstNameInputField.value,
            lastName: lastNameInputField.value
        })

        if (!updatedUser) return

        nameDisplay.innerHTML = updatedUser.firstName
    })
}, console.error)
