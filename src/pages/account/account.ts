import { userApi } from '../../api/userApi.ts'
import { User } from '#domain'

const avatarInput = document.getElementById('avatar') as HTMLInputElement

const saveBtn = document.getElementById('save-btn')!
const deleteImageBtn1 = document.getElementById('delete-btn1')!
const deleteImageBtn2 = document.getElementById('delete-btn2')!
const deleteImgBtns = [deleteImageBtn1, deleteImageBtn2]

const avatarImgSm = document.getElementById('avatar-img-sm') as HTMLImageElement
const avatarImgLg = document.getElementById('avatar-img-lg') as HTMLImageElement

const nameDisplay = document.getElementById('name-display')!
const firstNameInputField = document.getElementById('first-name') as HTMLInputElement
const lastNameInputField = document.getElementById('last-name') as HTMLInputElement
const emailInputField = document.getElementById('email') as HTMLInputElement

let userId: User['id']
let firstName: User['firstName']
let lastName: User['lastName']
let email: User['email']

async function fetchUserData(): Promise<void> {
    const userData = await userApi.getCurrent()
    if (!userData) {
        return
    }
    userId = userData.id
    email = userData.email
    firstName = userData.firstName
    lastName = userData.lastName
}

window.onload = async (): Promise<void> => {
    await fetchUserData()
    if (!firstName && !lastName && !email) {
        return
    }
    nameDisplay.textContent = firstName
    firstNameInputField.placeholder = firstName
    lastNameInputField.placeholder = lastName
    emailInputField.placeholder = email
}

saveBtn.addEventListener('click', async () => {
    await fetchUserData()
    await updateAndDisplayAvatar()
    await updateAndDisplayName()
})

async function updateAndDisplayAvatar(): Promise<void> {
    let file = avatarInput.files?.[0]
    console.log(file)

    if (!file) {
        console.log('error')
        return
    }
    try {
        await userApi.deleteAvatar(userId)
        await userApi.uploadAvatar(userId, file)

        userApi.getAvatarUrl(userId, avatarImgSm, deleteImageBtn2)
        userApi.getAvatarUrl(userId, avatarImgLg, deleteImageBtn1)
        avatarInput.value = ''
    } catch (error) {
        console.error(error)
    }
}

async function updateAndDisplayName(): Promise<void> {
    const firstNameValue = firstNameInputField.value
    const lastNameValue = lastNameInputField.value

    if (!firstNameValue && !lastNameValue) {
        return
    } else if (firstNameValue && lastNameValue) {
        await userApi.updateName(userId, { firstName: firstNameValue, lastName: lastNameValue })
        await fetchUserData()
        nameDisplay.textContent = firstName
    } else if (firstNameValue && !lastNameValue) {
        await userApi.updateName(userId, { firstName: firstNameValue })
        await fetchUserData()
        nameDisplay.textContent = firstName
    } else {
        await userApi.updateName(userId, { lastName: lastNameValue })
        await fetchUserData()
        nameDisplay.textContent = firstName
    }
}

deleteImgBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        await fetchUserData()
        await deleteAvatar()
        deleteImageBtn1.textContent = ''
        deleteImageBtn2.textContent = ''
    })
})
async function deleteAvatar(): Promise<void> {
    try {
        await userApi.deleteAvatar(userId)
        avatarImgSm.src = ''
        avatarImgLg.src = ''
    } catch (error) {
        console.error(error)
    }
}
