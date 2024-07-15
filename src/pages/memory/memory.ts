import { getLocationInfo } from 'src/utils/gmap'
import { memoryApi, supabase, userApi, storageApi } from '#api'
import { Memory, MemoryMessage, User } from '#domain'
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

// const moments = await memoryApi.getAllMomentsByMemoryId(memoryId)

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

const deleteMoment: {
    mode: boolean
    editControllers: HTMLDivElement
} = {
    mode: false,
    editControllers: q<HTMLDivElement>('#edit-controllers')
}

function resetSelectedMoments(): void {
    deleteMoment.editControllers.setAttribute('aria-hidden', 'true')
    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(ele => {
        ele.checked = false
    })
    document.querySelectorAll('label[data-select-label]').forEach(el => el.setAttribute('aria-hidden', 'true'))
    deleteMoment.mode = false
}

function checkIfImageExists(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = (): void => resolve(url)
        img.onerror = (): void => reject(new Error('failed to fetch cover image'))
    })
}

userApi
    .getCurrent()
    .then(async user => {
        if (!user) return

        updateCurrentUserChip(user)

        const memory = await memoryApi.get(memoryId, user.id)
        if (!memory) return

        const moments = await memoryApi.getAllMomentsByMemoryId(memoryId)

        OnlineCollaboratorBadges.init(user, memoryId)

        void MemoryChat.init(memoryId, memory.ownerId, user)

        const memoryLocation = memory.location ? await getLocationInfo(memory.location) : null
        q<HTMLSpanElement>('[data-memory="title"]').innerHTML = memory.title
        q<HTMLImageElement>('[data-memory="cover-sticker"]').src = memory.stickerId
            ? `/illustrations/${memory.stickerId}`
            : ''
        q<HTMLSpanElement>('[data-memory="cover-date"]').innerHTML = memory.date
        q<HTMLSpanElement>('[data-memory="cover-location"]').innerHTML = memoryLocation
            ? `, ${memoryLocation.city}, ${memoryLocation.country}`
            : ''

        const img = q<HTMLImageElement>('#memory-cover')

        const coverSrc = storageApi.getFileUrl(`memory/${memoryId}/cover`) + `?t=${Date.now()}`
        await checkIfImageExists(coverSrc)
            .then(res => {
                img.src = res
            })
            .catch(err => {
                console.error(err)
            })

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
                document.querySelectorAll<HTMLButtonElement>('#add-moment, #default-add-moment').forEach(e =>
                    e.addEventListener('click', () => {
                        addMomentModal.setAttribute('open', 'true')
                        addMomentModal.setAttribute('memory-id', memoryId)
                    })
                )
            })
            .catch(console.error)

        if (moments && moments.length > 0) {
            LatestMoments.init(moments)
        }

        function selectAndDeleteMoments(): void {
            q<HTMLButtonElement>('#edit-moment').addEventListener('click', () => {
                if (deleteMoment.mode) {
                    resetSelectedMoments()
                } else {
                    deleteMoment.editControllers.setAttribute('aria-hidden', 'false')
                    deleteMoment.mode = true
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
                resetSelectedMoments()
            })

            q<HTMLButtonElement>('button#select-all-moments').addEventListener('click', () => {
                document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-moment-id]').forEach(e => {
                    e.checked = true
                })
            })
        }
        selectAndDeleteMoments()

        const countDate = new CountTime(memory.date)
        q<HTMLSpanElement>('[data-yearly-count]').innerHTML = countDate.yearly()
        q<HTMLSpanElement>('[data-monthly-count]').innerHTML = countDate.monthly()
        q<HTMLSpanElement>('[data-weekly-count]').innerHTML = countDate.weekly()
        q<HTMLSpanElement>('[data-daily-count]').innerHTML = countDate.daily()
        q<HTMLSpanElement>('[data-hourly-count]').innerHTML = countDate.hourly()
        q<HTMLSpanElement>('[data-minutes-count]').innerHTML = countDate.minutes()
        q<HTMLSpanElement>('[data-seconds-count]').innerHTML = countDate.seconds()
    })
    .catch(console.error)

class OnlineCollaboratorBadges {
    private static readonly collaborators = new Map<User['id'], OnlineCollaborator>()
    private static list: HTMLUListElement
    private static listWrapper: HTMLDivElement
    private static template: HTMLTemplateElement
    private static currentUserId: User['id']

    public static init(currentUser: User, memoryId: Memory['id']): void {
        this.currentUserId = currentUser.id
        this.listWrapper = q('#online-collaborators')
        this.list = q<HTMLUListElement>('#collaborator-list', this.listWrapper)
        this.template = q<HTMLTemplateElement>('#collaborator-avatar', this.list)

        const room = supabase.channel(`collaborators:${memoryId}`)

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

    private static add(collaborator: OnlineCollaborator): void {
        if (collaborator.id === this.currentUserId || this.collaborators.has(collaborator.id)) return

        const collaboratorElem = this.template.content.cloneNode(true) as HTMLElement

        collaboratorElem.firstElementChild!.addEventListener('click', () => MemoryChat.toggleChat())

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

    private static remove(id: OnlineCollaborator['id']): void {
        if (id === this.currentUserId) return

        this.collaborators.delete(id)
        this.list.removeChild(q(`#id${id}`, this.list))
        this.sync()
    }

    public static isOnline(userId: User['id']): boolean {
        return this.collaborators.has(userId)
    }

    private static sync(): void {
        if (this.collaborators.size !== 0) {
            this.listWrapper.style.display = 'flex'
            return
        }

        this.listWrapper.style.display = 'none'
    }
}

class LatestMoments {
    public static init(moments: Moment[] | []): void {
        let allMoments: Moment[] = []

        const latestMoments = supabase.channel(`moments_on_${memoryId}`)
        if (moments.length) allMoments = moments

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
                            const newMoment = payload.new
                            if (newMoment.type !== 'description') return
                            renderMoments([newMoment])
                            allMoments.push(newMoment)
                            break
                        }
                        case 'DELETE': {
                            const filteredMoments = allMoments.filter(item => item.id !== payload.old.id)
                            rerenderMoments(filteredMoments)
                            break
                        }
                        case 'UPDATE': {
                            const newMoment = payload.new
                            if (newMoment.type === 'description') return
                            renderMoments([newMoment])
                            allMoments.push(newMoment)
                            break
                        }
                    }
                }
            )
            .subscribe()
    }
}

class MemoryChat {
    private static isOpen: boolean = false
    private static readonly messagesElem: HTMLDivElement = q('#messages-box')
    private static readonly messageTemplate: HTMLTemplateElement = q<HTMLTemplateElement>('#message-template')
    private static readonly chat: HTMLTemplateElement = q<HTMLTemplateElement>('#chat')
    private static readonly arrow: HTMLElement = q<HTMLTemplateElement>('#chat #chat-arrow')

    public constructor() {}

    public static toggleChat(): void {
        if (this.isOpen) {
            this.closeChat()
        } else {
            this.openChat()
        }
    }

    public static openChat(): void {
        if (this.isOpen) return

        this.isOpen = true
        this.chat.classList.toggle('-bottom-96')
        this.chat.classList.toggle('bottom-0')
        this.arrow.classList.toggle('rotate-180')
        this.scrollToEnd()
    }

    public static closeChat(): void {
        if (!this.isOpen) return

        this.isOpen = false
        this.chat.classList.toggle('-bottom-96')
        this.chat.classList.toggle('bottom-0')
        this.arrow.classList.toggle('rotate-180')
    }

    public static async init(memoryId: Memory['id'], ownerId: User['id'], currentUser: User): Promise<void> {
        q('#toggle-chat-btn').addEventListener('click', () => this.toggleChat())

        q('#chat #send').addEventListener('click', (): void => {
            this.sendMessage(memoryId, currentUser.id)
        })

        q('#chat input').addEventListener('keydown', e => {
            if (e.key !== 'Enter') return
            this.sendMessage(memoryId, currentUser.id)
        })

        const owner =
            currentUser.id === ownerId ? currentUser : ((await userApi.getUser({ key: 'id', value: ownerId })) as User)

        const memoryCollaborators = new Map<User['id'], User>([[owner.id, owner]])

        const [messages, collaborators] = await Promise.all([
            memoryApi.getMessages(memoryId),
            memoryApi.getAllCollaborators(memoryId)
        ])

        collaborators?.forEach(collaborator => memoryCollaborators.set(collaborator.id, collaborator))

        this.renderMessages(messages.filter(mes => memoryCollaborators.has(mes.userId)))
        this.scrollToEnd()

        memoryApi.subscribeOnMessages(memoryId, message => {
            const collaborator = memoryCollaborators.get(message.userId)
            if (!collaborator) return

            const messageElem = this.buildMessage({ ...message, userFirstName: collaborator.firstName })
            this.messagesElem.appendChild(messageElem)

            document.querySelector('#no-messages')?.remove()

            if (this.isOpen) {
                this.scrollToEnd()
            }
        })
    }

    private static sendMessage(memoryId: Memory['id'], userId: User['id']): void {
        const input = q<HTMLInputElement>('#chat input')
        const message = input.value

        if (!message) return

        input.value = ''

        void memoryApi.sendMessage(memoryId, userId, message)
    }

    private static scrollToEnd(): void {
        Array.from(this.messagesElem.children).at(-1)?.scrollIntoView({ block: 'end' })
    }

    private static renderMessages(messages: MemoryMessage[]): void {
        if (!messages.length) return

        document.querySelector('#no-messages')?.remove()

        const fragment = new DocumentFragment()

        messages.forEach(message => fragment.appendChild(this.buildMessage(message)))

        this.messagesElem.appendChild(fragment)
    }

    private static buildMessage(message: MemoryMessage): HTMLDivElement {
        const messageElem = this.messageTemplate.content.cloneNode(true) as HTMLDivElement

        const date = new Date(message.createdAt)

        const authorAvatar = q<HTMLImageElement>('[data-message=avatar]', messageElem)
        authorAvatar.src = userApi.getAvatarUrl(message.userId)
        authorAvatar.onload = (): void => {
            authorAvatar.classList.toggle('hidden')
        }

        q('[data-message=initials]', messageElem).innerHTML = message.userFirstName.slice(0, 1)
        q('[data-message=author]', messageElem).innerHTML = message.userFirstName
        q('[data-message=time]', messageElem).innerHTML =
            `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        q('[data-message=body]', messageElem).innerHTML = message.message

        return messageElem
    }
}

class CountTime {
    private readonly memoryDate: number
    public constructor(memoryDate: string) {
        this.memoryDate = Date.parse(memoryDate)
    }

    private getDiff(): number {
        const now = new Date().getTime()
        const memoryDate = new Date(this.memoryDate).getTime()
        return now - memoryDate
    }

    public yearly(): string {
        const diff = this.getDiff()
        return (diff / (1000 * 60 * 60 * 24 * 365)).toFixed(2)
    }

    public monthly(): string {
        const now = new Date()
        const memoryDate = new Date(this.memoryDate)
        const yearlyMonths = (now.getFullYear() - memoryDate.getFullYear()) * 12
        return String(yearlyMonths + now.getMonth() - memoryDate.getMonth())
    }

    public weekly(): string {
        const diff = this.getDiff()
        return (diff / (1000 * 60 * 60 * 24 * 7)).toFixed(0)
    }

    public hourly(): string {
        const diff = this.getDiff()
        return (diff / (1000 * 60 * 60)).toFixed(0)
    }

    public daily(): string {
        const diff = this.getDiff()
        return (diff / (1000 * 60 * 60 * 24)).toFixed(0)
    }

    public minutes(): string {
        const diff = this.getDiff()
        return (diff / (1000 * 60)).toFixed(0)
    }

    public seconds(): string {
        const diff = this.getDiff()
        return (diff / 1000).toFixed(2)
    }
}
