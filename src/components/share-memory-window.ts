import { memoryApi, userApi } from '#api'
import { Memory, User } from '#domain'
import { PromiseMaybe } from '#utils'

class ShareMemoryWindow extends HTMLElement {
    protected sharedUsers: User[] = []
    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.innerHTML = `
           <div class="w-full h-full flex flex-col items-center">
                <label class="flex w-full relative box-border h-8">
                    <input type="email" placeholder="i.e: abcdefe@mail.com"
                        class="input-sm  w-full box-border text-black bg-ui-50 rounded-lg border-2 border-slate-400"
                    >
                    <i class="fa-solid fa-user-plus ml-auto absolute -translate-y-1/2 top-1/2 right-3 text-basketball-500"></i>
                </label>
                <ul data-shared-users-list class="relative flex flex-col flex-grow gap-3 w-full overflow-y-scroll py-6">
                    <li data-placeholder-not-shared class="absolute top-6 w-full flex flex-row justify-between items-center">
                            <p class="w-full flex justify-center text-slate-400 text-base leading-normal">Not shared with anyone</p>
                    </li>
                </ul>
                <p class="text-xs text-type-300 w-full text-left my-4">This memory or event is only accessible to contributors. Share the link below to add more contributors</p>
                <div class="
                    flex flex-col w-full h-fit p-2 bg-slate-50 rounded-lg border border-gray-100 justify-center items-center gap-2
                    sm:flex-row sm:justify-between
                ">
                    <p class="text-xs text-gray-600 w-full text-left leading-normal">Private link: <a src="#" class="text-gray-700">rmmbr/lfdjalskfjlakjflkjaf;lafj</a></p>
                    <button type="button" class="
                        flex text-nowrap w-full h-8 px-4 py-2 bg-rose-100 rounded-3xl border border-red-300 justify-center items-center gap-1.5
                        sm:w-fit
                    ">
                        Share this link
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
           </div>
        `
        ;(this.querySelector('input[type="email"]') as HTMLInputElement).addEventListener(
            'blur',
            (ev: FocusEvent) => void this.addNewCollaborator((ev.currentTarget as HTMLInputElement).value)
        )
    }

    protected async attributeChangedCallback(): Promise<void> {
        if (this.newMemory) return
        await this.initSharedUsers()
        this.renderAllCollaborators()
    }

    private async initSharedUsers(): PromiseMaybe<void> {
        if (!this.memoryId || this.newMemory) {
            return
        }
        const sharedUsers = await memoryApi.getAllCollaborators(this.memoryId)
        this.sharedUsers = [...sharedUsers!]
    }

    private async addNewCollaborator(email: User['email']): Promise<void> {
        const user = await userApi.getTargetUser('email', email)
        if (!user) {
            return
        }
        await memoryApi.shareWith(this.memoryId!, [user.id]).then(res => {
            /**
             * todo: error handling
             * 1. case that the user already exist
             * 2. case taht the user did not exist or other(no need to show the reason)
             */
            if (!res) {
                return
            }
            this.sharedUsers.push(user)
            this.appendCollaborator(user)
        })
    }

    private async stopSharingWith(ev: MouseEvent): Promise<void> {
        await memoryApi.stopSharingWith(
            this.memoryId!,
            (ev.target as HTMLButtonElement).dataset.stopSharing as User['id']
        )
        this.sharedUsers = this.sharedUsers.filter(u => {
            return u.id !== (ev.target as HTMLButtonElement).dataset.stopSharing
        })
        ;(ev.target as HTMLButtonElement).parentElement!.remove()
    }

    private appendCollaborator(user: User): void {
        this.querySelector('[data-placeholder-not-shared]')?.remove()
        const newLi = document.createElement('li')
        newLi.innerHTML = `
                    <li class="w-full flex flex-row justify-between items-center">
                        <div>
                            <p class="text-slate-800 text-base leading-normal">${user.firstName} ${user.lastName}</p>
                            <span class="text-slate-600 text-xs">${user.email}</span>
                        </div>
                        <button data-stop-sharing="${user.id}" class="text-slate-900 py-2 px-4 box-border text-sm font-medium">Delete</button>
                    </li>
                `
        this.querySelector('[data-shared-users-list]')?.appendChild(newLi)
        ;(this.querySelector(`[data-stop-sharing="${user.id}"]`) as HTMLButtonElement).addEventListener(
            'click',
            (ev: MouseEvent) => void this.stopSharingWith(ev)
        )
    }

    private renderAllCollaborators(): void {
        ;(this.querySelector('[data-shared-users-list]') as HTMLUListElement).innerHTML = ''
        this.sharedUsers.forEach(u => {
            this.appendCollaborator(u)
        })
    }

    protected static get observedAttributes(): string[] {
        return ['memory-id', 'new-memory']
    }

    public get memoryId(): Memory['id'] | null {
        return this.getAttribute('memory-id') as Memory['id']
    }

    public get newMemory(): boolean {
        return this.hasAttribute('new-memory')
    }
}

customElements.define('share-memory-window', ShareMemoryWindow)
