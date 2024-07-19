import { codeAddress, initAutoComplete, q } from '#utils'
import { ModalBaseLayer } from 'src/components/modal-base-layer'
import '../share-memory-window'
import { memoryApi, storageApi } from '#api'
import { Memory, User } from '#domain'
import { getLocationInfo } from '#utils'

class EditMemoryModal extends ModalBaseLayer {
    private existing: boolean = false
    private readonly falsyValue: Set<string> = new Set(['false', 'null', '0', ''])

    public constructor() {
        super()
    }

    private renderContent(): void {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = `
            <div class="w-full h-full flex flex-col justify-between relative ">
                <header class="pb-6 gap-6">
                    <div class="flex items-center justify-between">
                        <h3 class="font-bold text-2xl">Edit Memory</h3>
                        <button data-modal-close class="text-basketball-500 text-3xl">
                                &#10005;
                        </button>
                    </div>
                    <div class="w-full flex py-2">
                        <button class="text-thick-blue-600 w-1/2 px-3 py-2 rounded-tl-lg rounded-tr-lg flex-col justify-center items-center gap-1 inline-flex text-lg aria-selected:border-b-2 aria-selected:border-indigo-600 aria-selected:font-bold" id="tab-event" role="tab" aria-controls="edit-memory-1" aria-selected="true" tabindex="0">Event</button>
                        <button class="text-thick-blue-600 w-1/2 px-3 py-2 rounded-tl-lg rounded-tr-lg flex-col justify-center items-center gap-1 inline-flex text-lg aria-selected:border-b-2 aria-selected:border-indigo-600 aria-selected:font-bold" id="tab-sharing" role="tab" aria-controls="edit-memory-2" aria-selected="false" tabindex="-1">Sharing</button>
                    </div>
                </header>
                <div id="edit-memory-1" role="tabpanel" aria-hidden="false" tabindex="0" class="p-1 flex flex-col flex-grow w-full overflow-auto aria-hidden:hidden no-scrollbar">
                    <div class="flex w-full aspect-[3/2] sm:aspect-[6/1] object-cover h-[30%] flex-shrink-0 relative rounded-lg overflow-hidden bg-gradient-to-b from-orange-300 to-indigo-500">
                        <img data-cover-image aria-hidden="true" id="cover-img" src="Memory cover" class="object-cover flex-grow aria-hidden:hidden">
                        <div class="flex justify-between p-4 h-full w-full absolute top-0 right-0 bg-gradient-to-b from-black/25 to-transparent">
                            <p class="text-white">Cover Image</p>
                            <div class="flex gap-3">
                                <input type="file" id="input-cover-img" class="hidden">
                                <button id="delete-cover" class="h-6 aspect-square text-white"><i data-feather="trash-2" class=""></i></button>
                                <label id="upload-cover" for="input-cover-img" class="h-6 aspect-square text-white"><i data-feather="edit" class=""></i></label>
                            </div>
                        </div>
                    </div>
                    <div class="w-full flex pt-6 flex-col flex-grow">
                        <div class="flex items-center justify-start gap-3 flex-shrink-0 relative">
                            <div class="h-full aspect-square w-12 overflow-hidden rounded-lg bg-indigo-600">
                                ${/* here would be stamp */ ''}
                            </div>
                            <p class="font-bold text-xl">Event sticker</p>
                            <button class="text-indigo-600"><i data-feather="edit"></i></button>
                        </div>

                        <ul class="grid w-full md:grid-cols-2 md:grid-rows-3 gap-4 pt-6">
                            <li class="flex flex-col gap-2 w-full">
                                <label class="text-slate-700 text-sm" for="memory-name-edit">Name of the event</label>
                                <input type="text" name="event-name" class="input input-sm">
                            </li>
                            <li class="flex flex-col gap-2 w-full">
                                <label class="text-slate-700 text-sm" for="memory-date-edit">Date</label>
                                <input type="date" name="date" class="input input-sm">
                            </li>
                            <li class="flex flex-col gap-2 w-full">
                                <label class="text-slate-700 text-sm" for="memory-location-edit">Location</label>
                                <input type="text" name="location" class="input input-sm">
                            </li>
                            <li class="flex flex-col gap-2 w-full md:col-start-2 md:row-span-full">
                                <label class="text-slate-700 text-sm">Description or Keynotes</label>
                                <textarea name="description" class="input input-sm h-56 grow resize-none"></textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="edit-memory-2" role="tabpanel" aria-hidden="true" tabindex="0" class="flex flex-col flex-grow w-full aria-hidden:hidden">
                    <share-memory-window class="h-full flex"></share-memory-window>
                </div>
                <footer class="flex pt-3 flex-col items-center gap-3 sm:pt-6 sm:gap-0 sm:justify-between sm:flex-row">
                    <button class="w-full sm:w-fit btn-text btn-md text-red-600 font-bold" id="delete-memory-btn">Delete Memory</button>

                    <div class="flex w-fit gap-4">
                        <button data-modal-close class="btn-text btn-md" id="close-edit-modal">Cancel</button>
                        <button class="btn-filled btn-md" id="save-changes-btn">Save changes</button>
                    </div>
                </footer>
            </div>
      `
    }

    protected connectedCallback(): void {
        this.renderBaseLayer()
        this.renderContent()
    }

    protected static get observedAttributes(): string[] {
        return ['open', 'memory-id', 'memory-owner-id', 'user-id']
    }

    protected async attributeChangedCallback(prop: string, oldVal: string, newVal: string | null): Promise<void> {
        switch (prop) {
            case 'open': {
                q<HTMLDivElement>('[data-modal-base]', this).classList.toggle('hidden')
                break
            }
            case 'memory-id': {
                if (newVal === oldVal || !this.memoryId) return
                q<HTMLElement>('share-memory-window', this).setAttribute('memory-id', this.memoryId)
                break
            }
            case 'memory-owner-id': {
                if (newVal === oldVal || !this.memoryOwnerId) return
                q<HTMLElement>('share-memory-window', this).setAttribute('memory-owner-id', this.memoryOwnerId)
                break
            }
        }
        if (!this.memoryId || !this.memoryOwnerId || !this.userId || this.existing) return
        await this.attachEvents()
        this.setCoverImg()
        this.existing = true
    }

    private tab(): void {
        const tabs = this.querySelectorAll('[role="tab"]')

        const toggle = (ev: MouseEvent): void => {
            const currentTarget = ev.currentTarget as HTMLButtonElement
            const activePanel = q<HTMLDivElement>('[aria-hidden="false"][role="tabpanel"]', this)
            const activeButton = q<HTMLButtonElement>('[aria-selected="true"]', this)
            const targetId = currentTarget.getAttribute('aria-controls')

            activeButton.setAttribute('aria-selected', 'false')
            activeButton.setAttribute('tabindex', '-1')
            currentTarget.setAttribute('aria-selected', 'true')
            currentTarget.setAttribute('tabindex', '0')

            activePanel.setAttribute('aria-hidden', 'true')
            q<HTMLDivElement>(`#${targetId}`).setAttribute('aria-hidden', 'false')
        }

        tabs.forEach(e => (e as HTMLButtonElement).addEventListener('click', toggle))
    }

    private setCoverImg(): void {
        const coverImg = q<HTMLImageElement>('[data-cover-image]', this)
        coverImg.src = storageApi.getFileUrl(`memory/${this.memoryId}/cover`) + `?t=${Date.now()}`
        coverImg.onload = (): void => {
            coverImg.setAttribute('aria-hidden', 'false')
        }
    }

    private deleteAllCoverImg(): void {
        document.querySelectorAll('[data-cover-image]').forEach(e => {
            ;(e as HTMLImageElement).setAttribute('aria-hidden', 'true')
            ;(e as HTMLImageElement).src = ''
        })
    }

    private async attachEvents(): Promise<void> {
        const title = q<HTMLInputElement>('input[name="event-name"]', this)
        const date = q<HTMLInputElement>('input[name="date"]', this)
        const location = q<HTMLInputElement>('input[name="location"]', this)
        const description = q<HTMLTextAreaElement>('textarea[name="description"]', this)
        await initAutoComplete(q<HTMLInputElement>('input[name="location"]'))

        const currentMemory = await memoryApi.get(this.memoryId as Memory['id'], this.userId as User['id'])

        if (!currentMemory) throw new Error('The memory does not exist or failed fetch the memory data')

        const locationInfo = currentMemory.location ? await getLocationInfo(currentMemory.location) : null

        title.value = currentMemory.title
        date.value = currentMemory.date
        location.value = locationInfo ? `${locationInfo.city}, ${locationInfo.country}` : ''
        description.value = currentMemory.description || ''

        q<HTMLInputElement>('#input-cover-img').addEventListener('change', async ev => {
            const file = (ev.currentTarget as HTMLInputElement).files?.[0]
            if (!file) return
            await memoryApi.uploadCover(this.memoryId as Memory['id'], file)
            this.setCoverImg()
        })
        q<HTMLButtonElement>('#delete-cover', this).addEventListener('click', async () => {
            await memoryApi.deleteCover(this.memoryId as Memory['id'])
            this.deleteAllCoverImg()
        })
        q<HTMLButtonElement>('#save-changes-btn', this).addEventListener('click', async () => {
            await memoryApi.update(this.memoryId as Memory['id'], {
                title: title.value,
                date: date.value,
                location: await codeAddress(location.value),
                description: description.value
            })
            this.close()
        })
        q<HTMLButtonElement>('#delete-memory-btn').addEventListener('click', async () => {
            await memoryApi.delete(this.memoryId as Memory['id'], this.userId as User['id']).then(res => {
                if (res) return
                window.location.href = '/'
            })
        })
        this.querySelectorAll('[data-modal-close]').forEach(e => e.addEventListener('click', () => this.close()))
        this.tab()
    }

    private close(): void {
        this.open = null
    }

    private get memoryOwnerId(): string | null {
        return this.getAttribute('memory-owner-id')
    }

    private get open(): boolean {
        return this.hasAttribute('open')
    }

    private get memoryId(): string | null {
        return this.getAttribute('memory-id')
    }

    private get userId(): string | null {
        return this.getAttribute('user-id')
    }

    private set open(val: string | null) {
        if (!val || this.falsyValue.has(val)) {
            this.removeAttribute('open')
            return
        }
        this.setAttribute('open', 'true')
    }
}

export default void customElements.define('edit-memory-modal', EditMemoryModal)
