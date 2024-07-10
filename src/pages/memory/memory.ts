import { memoryApi, supabase, userApi, storageApi } from '#api'
import { Memory, User } from '#domain'
import { Maybe, q, updateCurrentUserChip } from '#utils'
import { Moment } from '#domain'
import './edit-memory-modal'
import './add-moment-modal'

const urlParams = new URLSearchParams(location.search)
const memoryId = <Maybe<Memory['id']>>urlParams.get('id')

if (!memoryId) {
    throw new Error('Memory id not found')
}

type OnlineCollaborator = {
    id: User['id']
    avatar: User['avatarSrc']
    name: User['firstName']
}

const moments = await memoryApi.getAllMomentsByMemoryId(memoryId)

function rerenderMoments(moments: Maybe<Moment[]>): void {
    const momentList = q<HTMLUListElement>('[data-moment-list]')
    momentList.innerHTML = ''
    renderMoments(moments)
}

function renderMoments(moments: Maybe<Moment[]>): void {
    if (!moments) return
    const momentList = q<HTMLUListElement>('[data-moment-list]')
    const [imgMoment, videoMoment, descriptionMoment] = [
        q<HTMLTemplateElement>('[data-moment-img-item]'),
        q<HTMLTemplateElement>('[data-moment-video-item]'),
        q<HTMLTemplateElement>('[data-moment-description-item]')
    ]

    moments.forEach((m): void => {
        switch (m.type) {
            case 'image': {
                const imgFragment = document.importNode(imgMoment.content, true)
                const node = q<HTMLLIElement>('li', imgFragment)
                node.setAttribute('data-moment-id', m.id)
                q<HTMLInputElement>('input[type="checkbox"]', node).setAttribute('data-moment-id', m.id)
                const mediaPath = memoryApi.generateMomentMediaPath(m)
                q<HTMLImageElement>('img', node).src = storageApi.getFileUrl(mediaPath)!
                momentList.appendChild(node)
                break
            }
            case 'video': {
                const videoFragment = document.importNode(videoMoment.content, true)
                const node = q<HTMLLIElement>('li', videoFragment)
                node.setAttribute('data-moment-id', m.id)
                q<HTMLInputElement>('input[type="checkbox"]', node).setAttribute('data-moment-id', m.id)
                const mediaPath = memoryApi.generateMomentMediaPath(m)
                q<HTMLVideoElement>('video', node).src = storageApi.getFileUrl(mediaPath)!
                momentList.appendChild(node)
                break
            }
            case 'description': {
                const descriptionFragment = document.importNode(descriptionMoment.content, true)
                const node = q<HTMLLIElement>('li', descriptionFragment)
                q<HTMLParagraphElement>('p', descriptionFragment).innerHTML = m.description!
                node.setAttribute('data-moment-id', m.id)
                q<HTMLInputElement>('input[type="checkbox"]', node).setAttribute('data-moment-id', m.id)
                momentList.appendChild(node)
                break
            }
        }
    })
}

const editMoment: {
    mode: boolean
    editControllers: HTMLDivElement
} = {
    mode: false,
    editControllers: q<HTMLDivElement>('#edit-controllers')
}

function resetEditSelects(): void {
    editMoment.editControllers.setAttribute('aria-hidden', 'true')
    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(ele => {
        ele.checked = false
    })
    document.querySelectorAll('label[data-select-label]').forEach(el => el.setAttribute('aria-hidden', 'true'))
    editMoment.mode = false
}

userApi
    .getCurrent()
    .then(async user => {
        if (!user) return

        updateCurrentUserChip(user)

        const memory = await memoryApi.get(memoryId, user.id)
        if (!memory) return

        new Collaboration(user, memoryId)

        q('[data-memory="title"]').innerHTML = memory.title

        const coverSrc = storageApi.getFileUrl(`memory/${memoryId}/cover`) + `?t=${Date.now()}`

        const img = q<HTMLImageElement>('#memory-cover')

        img.src = coverSrc!
        img.onload = (): void => {
            img.classList.toggle('hidden')
        }

        // Create UI for Listing Stickers
        const stickers = [
            'airplane',
            'beach-ball',
            'camera',
            'coconut-palm-tree',
            'glasses',
            'globe',
            'heart-heart',
            'heart',
            'i-love-you',
            'juice',
            'leaf',
            'love-love-love-love',
            'love',
            'parasol',
            'pencil',
            'present',
            'shell',
            'ship',
            'sparkle',
            'starfish',
            'straw-hat',
            'suitcase',
            'sun',
            'sunglasses',
            'tropical-juice',
            'yacht'
        ]
        function renderStickers(): void {
            const container = q('#sticker')
            stickers.forEach(id => {
                const img = document.createElement('img')
                img.id = id
                img.src = `/sticker/${id}.svg`
                img.alt = id
                container.appendChild(img)
            })
        }
        renderStickers()

        // Update Sticker
        let clickedStickerId: Maybe<string>
        const stickerSection = q('#sticker')
        stickerSection.addEventListener('click', (event: MouseEvent) => {
            const elem = event.target as HTMLElement
            if (elem.id === 'sticker') return
            clickedStickerId = elem.id
        })

        const saveStickerButton = q('#save-sticker-btn')
        saveStickerButton.addEventListener('click', async () => {
            await memoryApi.update(memoryId, { stickerId: clickedStickerId })
        })

        // Delete Sticker
        const deleteStickerButton = q('#delete-sticker-btn')
        deleteStickerButton.addEventListener('click', async () => {
            await memoryApi.update(memory.id, { stickerId: null })
        })
        renderMoments(moments)

        await customElements
            .whenDefined('edit-memory-modal')
            .then(() => {
                const editMemoryModal = q<HTMLDivElement>('edit-memory-modal')
                editMemoryModal.setAttribute('memory-id', memoryId)
                editMemoryModal.setAttribute('memory-owner-id', memory.ownerId)
                editMemoryModal.setAttribute('user-id', user.id)
                q<HTMLButtonElement>('#edit-memory').addEventListener('click', () => {
                    editMemoryModal.setAttribute('open', 'true')
                })
            })
            .catch(console.error)

        await customElements
            .whenDefined('add-moment-modal')
            .then(() => {
                const addMomentModal = q<HTMLDivElement>('add-moment-modal')
                q<HTMLButtonElement>('#add-moment').addEventListener('click', () => {
                    addMomentModal.setAttribute('open', 'true')
                    addMomentModal.setAttribute('memory-id', memoryId)
                })
            })
            .catch(console.error)

        // activate real-time update for moments
        new LatestMoments()

        function selectAndDeleteMoments(): void {
            q<HTMLButtonElement>('#edit-moment').addEventListener('click', () => {
                if (editMoment.mode) {
                    resetEditSelects()
                } else {
                    editMoment.editControllers.setAttribute('aria-hidden', 'false')
                    editMoment.mode = true
                    document
                        .querySelectorAll('label[data-select-label]')
                        .forEach(el => el.setAttribute('aria-hidden', 'false'))
                }
            })

            q<HTMLButtonElement>('button#delete-moments-btn').addEventListener('click', async () => {
                const momentIds = Array.from<HTMLInputElement>(
                    document.querySelectorAll('input[type="checkbox"]:checked[data-moment-id]')
                ).map(m => m.dataset.momentId)
                await memoryApi.deleteMoments(momentIds as Array<Moment['id']>)
                resetEditSelects()
            })

            q<HTMLButtonElement>('button#select-all-moments').addEventListener('click', () => {
                document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-moment-id]').forEach(e => {
                    e.checked = true
                })
            })
        }
        selectAndDeleteMoments()
    })
    .catch(console.error)

class Collaboration {
    private readonly collaborators = new Map<User['id'], OnlineCollaborator>()
    private readonly list: HTMLUListElement
    private readonly listWrapper: HTMLDivElement
    private readonly template: HTMLTemplateElement
    private readonly currentUserId: User['id']

    public constructor(currentUser: User, memoryId: Memory['id']) {
        this.currentUserId = currentUser.id
        this.listWrapper = q('#online-collaborators')
        this.list = q<HTMLUListElement>('#collaborator-list', this.listWrapper)
        this.template = q<HTMLTemplateElement>('#collaborator-avatar', this.list)

        const room = supabase.channel(memoryId)

        room.on('presence', { event: 'sync' }, () => {
            const state = room.presenceState<OnlineCollaborator>()

            for (const key in state) {
                if (!Object.prototype.hasOwnProperty.call(state, key)) {
                    continue
                }

                state[key].forEach(collaborator => this.add(collaborator))
            }
        })
            .on<OnlineCollaborator>('presence', { event: 'join' }, ({ newPresences }) => {
                newPresences.forEach(collaborator => this.add(collaborator))
            })
            .on<OnlineCollaborator>('presence', { event: 'leave' }, ({ leftPresences }) => {
                leftPresences.forEach(collaborator => this.remove(collaborator.id))
            })
            .subscribe(status => {
                if (status !== 'SUBSCRIBED') {
                    return
                }

                room.presenceState()

                void room.track({
                    id: currentUser.id,
                    name: currentUser.firstName,
                    avatar: currentUser.avatarSrc
                } satisfies OnlineCollaborator)
            })
    }

    public add(collaborator: OnlineCollaborator): void {
        if (collaborator.id === this.currentUserId || this.collaborators.has(collaborator.id)) return

        const collaboratorElem = this.template.content.cloneNode(true) as HTMLElement

        const avatar = q<HTMLImageElement>('[data-collaborator=avatar]', collaboratorElem)
        q('[data-collaborator=initials]', collaboratorElem).innerHTML = collaborator.name.slice(0, 1).toUpperCase()
        avatar.src = collaborator.avatar || ''
        avatar.onload = (): void => {
            avatar.classList.toggle('hidden')
        }

        collaboratorElem.firstElementChild!.id = `id${collaborator.id}`
        ;(collaboratorElem.firstElementChild as HTMLLIElement).title = collaborator.name

        this.list.appendChild(collaboratorElem)

        this.collaborators.set(collaborator.id, collaborator)
        this.sync()
    }

    public remove(id: OnlineCollaborator['id']): void {
        if (id === this.currentUserId) return

        this.collaborators.delete(id)
        this.list.removeChild(q(`#id${id}`, this.list))
        this.sync()
    }

    private sync(): void {
        if (this.collaborators.size !== 0) {
            this.listWrapper.style.display = 'flex'
            return
        }

        this.listWrapper.style.display = 'none'
    }
}

class LatestMoments {
    public constructor() {
        const latestMoments = supabase.channel(`moments_on_${memoryId}`)

        latestMoments
            .on<Moment>(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'moments',
                    filter: `memoryId=eq.${memoryId}`
                },
                payload => {
                    switch (payload.eventType) {
                        case 'INSERT': {
                            const newMemory = payload.new
                            if (newMemory.type !== 'description') return
                            renderMoments([newMemory])
                            break
                        }
                        case 'DELETE': {
                            const filteredMoments = moments?.filter(item => item.id !== payload.old.id)
                            rerenderMoments(filteredMoments)
                            break
                        }
                        case 'UPDATE': {
                            const newMemory = payload.new
                            if (newMemory.type === 'description') return
                            renderMoments([newMemory])
                            break
                        }
                    }
                }
            )
            .subscribe()
    }
}
