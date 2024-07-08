import { codeAddress, initAutoComplete, q } from '#utils'
import { ModalBaseLayer } from 'src/components/modal-base-layer'
import '../share-memory-window'
import { memoryApi, storageApi } from '#api'
import { Memory, User } from '#domain'
import { reverseGeocode } from 'src/utils/gmap'

class EditMemoryModal extends ModalBaseLayer {
    private exsting: boolean = false
    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.renderBaseLayer()
        this.renderContent()
    }

    private renderContent(): void {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = /* html */ `
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
				<div id="edit-memory-1" role="tabpanel" aria-hidden="false" tabindex="0" class="flex flex-col flex-grow w-full overflow-x-hidden overflow-y-scroll sm:overflow-y-hidden aria-hidden:hidden">
					<div class="w-full aspect-[3/2] sm:aspect-[6/1] object-cover h-[30%] relative rounded-lg overflow-hidden bg-gradient-to-b from-orange-300 to-indigo-500">
						<img data-cover-image aria-hidden id="cover-img" src="" class="object-cover aria-hidden:hidden">
						<div class="flex justify-between p-4 h-full w-full absolute top-0 right-0 bg-gradient-to-b from-black/25 to-transparent">
							<p class="text-white">Cover Image</p>
							<div class="flex gap-3">
								<input type="file" id="input-cover-img" class="hidden">
								<button id="delete-cover" class="h-6 aspect-square text-white"><i class="fa-solid fa-trash"></i></button>
								<button id="upload-cover" class="h-6 aspect-square text-white"><i class="fa-solid fa-pen"></i></button>
							</div>
						</div>
					</div>
					<div class="w-full flex pt-6 flex-col h-[70%]">
						<div class="flex items-center justify-start gap-3 h-[15%] relative">
							<div class="h-full aspect-square overflow-hidden rounded-lg bg-indigo-600">
								${/* here would be stamp */ ''}
							</div>
							<p class="font-bold text-xl">Event Sticker</p>
							<button class="text-indigo-600"><i class="fa-solid fa-pen-to-square"></i></button>
						</div>
						<ul class="flex flex-col w-full gap-x-4 flex-nowrap justify-between pt-6 h-[85%] gap-3 sm:gap-y-0 sm:w-[calc(100%-1rem)] sm:flex-wrap">
							<li class="flex flex-col gap-2 w-full h-fit sm:w-1/2 max-h-[calc(100%/3)]">
								<label class="text-slate-700 text-sm" for="memory-name-edit">Name of the event</label>
								<input type="text" name="event-name" class="input-sm rounded-md text-black border-2 border-slate-400 bg-ui-50">
							</li>
							<li class="flex flex-col gap-2 w-full h-fit sm:w-1/2 max-h-[calc(100%/3)]">
								<label class="text-slate-700 text-sm" for="memory-date-edit">Date</label>
								<input type="date" name="date" class="input-sm rounded-md text-black border-2 border-slate-400 bg-ui-50">
							</li>
							<li class="flex flex-col gap-2 w-full h-fit sm:w-1/2 max-h-[calc(100%/3)]">
								<label class="text-slate-700 text-sm" for="memory-location-edit">Location</label>
								<input type="text" name="location" class="input-sm rounded-md text-black border-2 border-slate-400 bg-ui-50">
							</li>
							<li class="flex flex-col gap-2 w-full h-fit sm:w-1/2 sm:h-full">
								<label class="text-slate-700 text-sm">Description or Keynotes</label>
								<textarea name="description" class="input-sm rounded-md text-black h-56 border-2 border-slate-400 bg-ui-50 grow"></textarea>
							</li>
						</ul>
					</div>
				</div>
				<div id="edit-memory-2" role="tabpanel" aria-hidden="true" tabindex="0" class="flex flex-col flex-grow w-full aria-hidden:hidden">
					<share-memory-window class="h-full flex"></share-memory-window>
				</div>
				<footer class="flex  pt-3 flex-col items-center gap-3 sm:pt-6 sm:gap-0 sm:justify-between sm:flex-row">
					<button class="text-basketball-500 font-bold py-2 px-3" id="delete-memory-btn">Delete Memory</button>
					<div class="flex w-fit gap-4">
						<button data-modal-close class="py-2 px-3" id="close-edit-modal">Cancel</button>
						<button class="bg-orange-600 rounded-3xl justify-center items-center gap-1 inline-flex text-white py-2 px-3" id="save-changes-btn">Save changes</button>
					</div>
				</footer>
			</div>
      `
    }

    private setCoverImg(): void {
        const coverImg = q<HTMLImageElement>('[data-cover-image]', this)
        coverImg.src = storageApi.getFileUrl(`memory/${this.memoryId}/cover`) + `?t=${Date.now()}`
        coverImg.setAttribute('aria-hidden', 'false')
    }

    private setAllCoverImg(): void {
        document.querySelectorAll('[data-cover-image]').forEach(e => {
            ;(e as HTMLImageElement).setAttribute('aria-hidden', 'false')
            ;(e as HTMLImageElement).src = storageApi.getFileUrl(`memory/${this.memoryId}/cover`) + `?t=${Date.now()}`
        })
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

        title.value = currentMemory.title
        date.value = currentMemory.date
        location.value = currentMemory.location ? await reverseGeocode(currentMemory.location) : ''
        description.value = currentMemory.description || ''

        q<HTMLInputElement>('#input-cover-img').addEventListener('change', async ev => {
            const file = (ev.currentTarget as HTMLInputElement).files?.[0]
            if (!file) return
            await memoryApi.uploadCover(this.memoryId as Memory['id'], file)
            this.setAllCoverImg()
        })
        q<HTMLButtonElement>('#upload-cover').addEventListener('click', () =>
            q<HTMLInputElement>('#input-cover-img').click()
        )
        q<HTMLButtonElement>('#delete-cover').addEventListener('click', async () => {
            await memoryApi.deleteCover(this.memoryId as Memory['id'])
            this.deleteAllCoverImg()
        })
        q<HTMLButtonElement>('#save-changes-btn').addEventListener('click', async () => {
            await memoryApi.update(this.memoryId as Memory['id'], {
                title: title.value,
                date: date.value,
                location: (await codeAddress(location.value)) || null,
                description: description.value
            })
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
        if (!this.memoryId || !this.memoryOwnerId || !this.userId || this.exsting) return
        await this.attachEvents()
        this.setCoverImg()
        this.exsting = true
    }

    protected tab(): void {
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

    private get memoryOwnerId(): string | null {
        return this.getAttribute('memory-owner-id')
    }

    public get open(): boolean {
        return this.hasAttribute('open')
    }

    public get memoryId(): string | null {
        return this.getAttribute('memory-id')
    }

    private get userId(): string | null {
        return this.getAttribute('user-id')
    }

    public set open(val: string | null) {
        if (!val || ['false', 'null', '0', '', null].includes(val)) {
            this.removeAttribute('open')
            return
        }
        this.setAttribute('open', 'true')
    }
}

export default void customElements.define('edit-memory-modal', EditMemoryModal)
