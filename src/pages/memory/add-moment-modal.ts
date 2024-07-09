import { memoryApi } from '#api'
import { Memory, Moment } from '#domain'
import { getExtensionName, PromiseMaybe, q } from '#utils'
import { ModalBaseLayer } from 'src/components/modal-base-layer'

class AddMomentModal extends ModalBaseLayer {
    private readonly imageExtensions: string[] = ['png', 'jpg', 'webp', 'svg']
    private readonly videoExtensions: string[] = ['mp4', 'avi', 'mov', 'webm']

    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.renderBaseLayer()
        this.renderContent()
    }

    protected renderContent(): void {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = /* html */ `
            <div class="w-full h-full flex flex-col justify-between relative">
                <header class="pb-6 gap-6">
                    <div class="flex items-center justify-between">
						<h3 class="font-bold text-2xl">Add new moments</h3>
						<button data-modal-close class="text-basketball-500 text-3xl">
								&#10005;
						</button>
					</div>

                    <div class="w-full flex py-2">
                        <button
                            class="text-thick-blue-600 w-1/2 px-3 py-2 rounded-tl-lg rounded-tr-lg flex-col justify-center items-center gap-1 inline-flex text-lg aria-selected:border-b-2 aria-selected:border-indigo-600 aria-selected:font-bold"
                            id="tab-media"
                            role="tab"
                            aria-controls="add-moment-1"
                            aria-selected="true"
                            tabindex="0">Video, Photo</button>
                        <button
                            class="text-thick-blue-600 w-1/2 px-3 py-2 rounded-tl-lg rounded-tr-lg flex-col justify-center items-center gap-1 inline-flex text-lg aria-selected:border-b-2 aria-selected:border-indigo-600 aria-selected:font-bold"
                            id="tab-description"
                            role="tab"
                            aria-controls="add-moment-2"
                            aria-selected="false"
                            tabindex="-1">Note, Reflection</button>
                    </div>
                </header>
                <div id="add-moment-1" role="tabpanel" aria-hidden="false" tabindex="0" class="flex flex-col flex-grow w-full overflow-x-hidden overflow-y-scroll sm:overflow-y-hidden aria-hidden:hidden">
                    <div class="w-full h-full flex flex-col items-center justify-center">
                        <input type="file" id="media-input" class="hidden">
                        <label for="media-input">
                        <img src="/illustrations/taking-pic.svg">
                        </label>
                        <button
                            id="pick-media"
                            class="mt-4 px-6 py-2 bg-indigo-700 rounded-3xl border border-indigo-300 justify-center items-center gap-2 flex text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">Pick from your gallery <i class="fa-solid fa-arrow-up-from-bracket"></i></button>
                    </div>
                </div>
                <div id="add-moment-2" role="tabpanel" aria-hidden="true" tabindex="0" class="flex flex-col items-center justify-center flex-grow w-full overflow-x-hidden overflow-y-scroll sm:overflow-y-hidden aria-hidden:hidden">
                    <div class="flex flex-col h-full w-full items-center justify-center gap-6 sm:flex-row">
                        <img src="/illustrations/calming-girl.svg" class="w-1/2 sm:w-2/5">
                        <div class="flex flex-col h-1/2 w-full items-start gap-2">
                            <label for="description-input" class="text-slate-700">Note, or Reflection</label>
                            <Textarea id="description-input" class="w-full border-ui-300 border-2 p-3 rounded-md h-full"></Textarea>
                        </div>
                    </div>
                </div>
				<footer class="flex w-full pt-3 flex-col items-center gap-3 sm:pt-6 sm:gap-0 sm:justify-between sm:flex-row">
					<div class="flex w-fit gap-4">
						<button data-modal-close class="py-2 px-3" id="close-edit-modal">Cancel</button>
						<button
                            class="bg-orange-600 rounded-3xl justify-center items-center gap-1 inline-flex text-white py-2 px-3"
                            id="save-changes-btn">Save changes</button>
					</div>
                </footer>
            </div>
        `
    }

    protected static get observedAttributes(): string[] {
        return ['open', 'memory-id']
    }

    protected attributeChangedCallback(prop: string, oldVal: string, newVal: string): void {
        if (prop === 'open') {
            q<HTMLDivElement>('[data-modal-base]', this).classList.toggle('hidden')
        }
        if (prop === 'memory-id' && newVal && newVal !== oldVal) {
            this.attachEvents()
        }
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

    private attachEvents(): void {
        this.querySelectorAll('button[data-modal-close]').forEach(el =>
            el.addEventListener('click', () => this.close())
        )
        q<HTMLButtonElement>('button#pick-media').addEventListener('click', () => {
            q<HTMLInputElement>('input#media-input').click()
        })
        q<HTMLButtonElement>('button#save-changes-btn').addEventListener('click', async () => {
            if (q<HTMLInputElement>('input#media-input').value) await this.uploadVideoPic()
            if (q<HTMLTextAreaElement>('textarea#description-input').value) await this.uploadDescription()
            this.close()
        })
        this.tab()
    }

    private getType(extensionName: string | null): 'image' | 'video' | null {
        if (!extensionName) return null

        if (this.imageExtensions.includes(extensionName)) {
            return 'image'
        }
        if (this.videoExtensions.includes(extensionName)) {
            return 'video'
        }
        return null
    }

    private async uploadVideoPic(): PromiseMaybe<Moment> {
        const mediaInput = q<HTMLInputElement>('input#media-input')

        if (!mediaInput.value || !mediaInput.files || !this.memoryId) return

        const extName = getExtensionName(mediaInput.value)
        const type = this.getType(extName)

        if (!type) throw new Error('could not identify the file type')

        const res = await memoryApi.createMediaMoment(
            {
                type: type,
                file: mediaInput.files[0]
            },
            this.memoryId
        )

        return res
    }

    private async uploadDescription(): PromiseMaybe<Moment[]> {
        if (!this.memoryId) throw new Error('memoryId is not given')
        const desc = q<HTMLTextAreaElement>('textarea#description-input').value
        const res = await memoryApi.createDescriptionMoment(desc, this.memoryId)
        return res
    }

    private close(): void {
        this.open = null
    }

    private get open(): boolean {
        return this.hasAttribute('open')
    }

    private get memoryId(): Memory['id'] | null {
        return this.getAttribute('memory-id') as Memory['id']
    }

    private set open(val: string | null) {
        if (!val || ['false', 'null', '0', '', null].includes(val)) {
            this.removeAttribute('open')
            return
        }
        this.setAttribute('open', 'true')
    }
}

export default void customElements.define('add-moment-modal', AddMomentModal)
