import { memoryApi, userApi } from '#api'
import { Memory, User } from '#domain'
import { PromiseMaybe, q } from '#utils'

class ShareMemoryWindow extends HTMLElement {
    protected collaborators: User[] = []
    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.innerHTML = `
           <div class="w-full h-full flex flex-col items-center">
                <label class="flex w-full relative box-border h-8">
                    <input data-search-collaborator type="email" placeholder="i.e: abcdefe@mail.com"
                        class="input-sm  w-full box-border text-black bg-ui-50 rounded-lg border-2 border-slate-400"
                    >
                    <i class="fa-solid fa-user-plus ml-auto absolute -translate-y-1/2 top-1/2 right-3 text-basketball-500"></i>
                </label>
                <ul data-shared-users-list class="relative flex flex-col flex-grow gap-3 w-full overflow-y-scroll py-6">
                    <li data-placeholder-not-shared class="absolute z-0 top-6 w-full flex flex-row justify-between items-center">
                            <p class="w-full flex justify-center text-slate-400 text-base leading-normal">Not shared with anyone</p>
                    </li>
                </ul>
                <p class="text-xs text-type-300 w-full text-left my-4">This memory or event is only accessible to contributors. Share the link below to add more contributors</p>
                <div class="
                    flex flex-col w-full h-fit p-2 bg-slate-50 rounded-lg border border-gray-100 justify-center items-center gap-2
                    sm:flex-row sm:justify-between
                ">
                    <p class="text-xs text-gray-600 w-full text-left leading-normal">Private link: <span id="show-link" class="text-gray-700 line-clamp-1">rmmbr/lfdjalskfjlakjflkjaf;lafj</span></p>
                    <button id="copy-link" type="button" class="
                        flex text-nowrap w-full h-8 px-4 py-2 bg-rose-100 rounded-3xl border border-red-300 justify-center items-center gap-1.5
                        sm:w-fit
                    ">
                        Share this link
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
           </div>
        `
        q<HTMLInputElement>('input[type="email"]', this).addEventListener(
            'blur',
            (ev: FocusEvent) => void this.addNewCollaborator((ev.currentTarget as HTMLInputElement).value)
        )
    }

    protected async attributeChangedCallback(oldVal: string, newVal: string): Promise<void> {
        if (this.newMemory) return
        await this.getExistingCollaborators()
        this.renderAllCollaborators()
        if (oldVal !== newVal && this.memoryId && this.memoryOwnerId) {
            this.shareLink()
        }
    }

    protected static get observedAttributes(): string[] {
        return ['memory-id', 'new-memory']
    }

    private shareLink(): void {
        q<HTMLButtonElement>('#copy-link').addEventListener('click', async () => {
            const origin = new URL(import.meta.url).origin
            await navigator.clipboard.writeText(`${origin}/memory/?id=${this.memoryId}`)
        })
        q<HTMLSpanElement>('#show-link').innerHTML = `/memory/?id=${this.memoryId}`
    }

    private async getExistingCollaborators(): PromiseMaybe<void> {
        if (!this.memoryId) {
            return
        }
        const collaborators = await memoryApi.getAllCollaborators(this.memoryId)
        this.collaborators = [...collaborators!]
    }

    private async addNewCollaborator(email: User['email']): Promise<void> {
        const user = await userApi.getUser({ key: 'email', value: email })
        if (!user || user.id === this.memoryOwnerId) {
            /**
             * todo: error handling
             * case1: user does not exist → just show the message "could not find the user"
             * case2: trying add the memory's owner email → can not add additional the access to the memory owner
             */
            return
        }
        await memoryApi.shareWith(this.memoryId!, [user.id]).then(res => {
            if (!res) {
                /**
                 * todo: error handling
                 * 1. case that the user already exist
                 */
                return
            }
            this.collaborators.push(user)
            this.appendCollaborator(user)
            q<HTMLInputElement>('[data-search-collaborator]', this).value = ''
        })
    }

    private async stopSharingWith(ev: MouseEvent): Promise<void> {
        await memoryApi.stopSharingWith(
            this.memoryId!,
            (ev.target as HTMLButtonElement).dataset.stopSharing as User['id']
        )
        this.collaborators = this.collaborators.filter(u => {
            return u.id !== (ev.target as HTMLButtonElement).dataset.stopSharing
        })
        ;(ev.target as HTMLButtonElement).parentElement!.remove()
    }

    private appendCollaborator(user: User): void {
        const newLi = document.createElement('li')
        newLi.classList.add('z-10', 'bg-white', 'w-full', 'flex', 'flex-row', 'justify-between', 'items-center')
        newLi.innerHTML = `
            <div>
                <p class="text-slate-800 text-base leading-normal">${user.firstName} ${user.lastName}</p>
                <span class="text-slate-600 text-xs">${user.email}</span>
            </div>
            <button data-stop-sharing="${user.id}" class="text-slate-900 py-2 px-4 box-border text-sm font-medium">Delete</button>
        `
        q<HTMLUListElement>('[data-shared-users-list]', this).appendChild(newLi)
        q<HTMLButtonElement>(`[data-stop-sharing="${user.id}"]`, this).addEventListener(
            'click',
            (ev: MouseEvent) => void this.stopSharingWith(ev)
        )
    }

    private renderAllCollaborators(): void {
        if (!this.collaborators.length) return
        q<HTMLUListElement>('[data-shared-users-list]', this).innerHTML = ''
        this.collaborators.forEach(u => {
            this.appendCollaborator(u)
        })
    }

    private get memoryId(): Memory['id'] | null {
        return this.getAttribute('memory-id') as Memory['id']
    }

    private get memoryOwnerId(): Memory['ownerId'] | null {
        return this.getAttribute('memory-owner-id') as Memory['ownerId']
    }

    private get newMemory(): boolean {
        return this.hasAttribute('new-memory')
    }
}

customElements.define('share-memory-window', ShareMemoryWindow)
