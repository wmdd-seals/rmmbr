import { memoryApi, supabase } from '#api'
import { Memory, User } from '#domain'
import { Maybe, q } from '#utils'

const urlParams = new URLSearchParams(location.search)
const memoryId = <Maybe<Memory['id']>>urlParams.get('id')

if (!memoryId) {
    throw new Error('Memory id not found')
}

supabase.auth
    .getUser()
    .then(async res => {
        const user = res.data.user
        if (!user) return

        const memory = await memoryApi.get(memoryId, <User['id']>user.id)
        if (!memory) return

        q('[data-memory="title"]').innerHTML = memory.title

        // const cover = storageApi.getFileUrl(`memory/${memoryId}/cover`)

        const input = q<HTMLInputElement>('#file-input')
        input.addEventListener('change', () => {
            const cover = input.files?.[0]

            if (!cover) return

            void memoryApi.uploadCover(memoryId, cover)
        })

        const deleteButton = q('#delete-file')
        deleteButton.addEventListener('click', () => memoryApi.deleteCover(memoryId))
    })
    .catch(console.error)
