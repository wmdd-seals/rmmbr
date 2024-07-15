import { memoryApi } from '#api'
import { Memory, Moment } from '#domain'
import { Maybe, PromiseMaybe, q } from '#utils'
import { ModalBaseLayer } from 'src/components/modal-base-layer'

class AddMomentModal extends ModalBaseLayer {
    private readonly falsyValue: Set<string> = new Set(['false', 'null', '0', ''])
    private readonly imageMime: Set<string> = new Set(['image/jpeg', 'image/png', 'image/webp'])
    private readonly videoMime: Set<string> = new Set(['video/mp4', 'video/x-msvideo', 'video/webm'])
    private currentFiles: Array<File> = []
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
                        <input type="file" id="media-input" class="hidden" multiple>
                        <div data-media-preview class="peer h-full hidden has-[[data-preview-item]]:flex justify-center items-start sm:justify-start gap-4 flex-wrap w-full content-start overflow-y-scroll">
                        </div>
                        <label for="media-input" class="peer-has-[[data-preview-item]]:hidden">
                            <img src="/illustrations/taking-pic.svg">
                        </label>
                        <label
                            id="pick-media"
                            for="media-input"
                            class="peer-has-[[data-preview-item]]:hidden mt-4 px-6 py-2 bg-indigo-700 rounded-3xl border border-indigo-300 justify-center items-center gap-2 flex text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">Pick from your gallery <i class="fa-solid fa-arrow-up-from-bracket"></i></label>
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
            <template id="preview-item-template">
                <div data-preview-item class="flex h-32 relative">
                    <span data-file-modifier class="absolute -top-1 -right-1 w-6 h-6 text-sm flex justify-center items-center rounded-full bg-white font-bold text-indigo-700">&#10005;</span>

                </div>
            </template>
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

    protected renderPreviews(): void {
        const previewArea = q<HTMLDivElement>('[data-media-preview]')
        q<HTMLInputElement>('input#media-input', this).addEventListener('change', (ev: Event) => {
            const currentTarget = ev.currentTarget as HTMLInputElement
            Array.from<File>(currentTarget.files as FileList).forEach(item => {
                this.currentFiles.push(item)
            })
            this.currentFiles.forEach((file: File) => {
                const fileType = (): string | null => {
                    if (this.imageMime.has(file.type)) return 'img'
                    if (this.videoMime.has(file.type)) return 'video'
                    return null
                }

                if (!fileType()) return
                const template = q<HTMLTemplateElement>('#preview-item-template', this).content.cloneNode(
                    true
                ) as HTMLDivElement
                const preview = document.createElement(fileType()!) as HTMLImageElement | HTMLVideoElement
                preview.classList.add('flex', 'object-cover', 'h-full', 'aspect-square')
                preview.src = URL.createObjectURL(file)
                template.querySelector('div')!.append(preview)
                template
                    .querySelector('[data-file-modifier]')
                    ?.setAttribute('data-file-modifier', String(file.lastModified))
                template.querySelector('[data-file-modifier]')?.addEventListener('click', (ev: Event) => {
                    this.currentFiles = this.currentFiles.filter(
                        item => item.lastModified !== Number((ev.currentTarget as HTMLSpanElement).dataset.fileModifier)
                    )
                    ;(ev.currentTarget as HTMLSpanElement).parentElement?.remove()
                })
                previewArea.appendChild(template)
            })
        })
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
        q<HTMLButtonElement>('button#save-changes-btn').addEventListener('click', async () => {
            if (this.currentFiles.length) await this.uploadVideoPic()
            if (q<HTMLTextAreaElement>('textarea#description-input').value) await this.uploadDescription()
            this.close()
        })
        this.renderPreviews()
        this.tab()
    }

    private getType(type: string | null): 'image' | 'video' | null {
        if (!type) return null

        if (this.imageMime.has(type)) {
            return 'image'
        }
        if (this.videoMime.has(type)) {
            return 'video'
        }
        return null
    }

    private uploadVideoPic(): Promise<Maybe<Moment>[]> | void {
        if (!this.currentFiles.length || !this.memoryId) return

        const results = Promise.all(
            Array.from<File>(this.currentFiles).map(async (file: File) => {
                const type = this.getType(file.type)

                if (!type) throw new Error('could not identify the file type')

                const res = await memoryApi.createMediaMoment(
                    {
                        type: type,
                        file: file
                    },
                    this.memoryId as Memory['id']
                )
                return res
            })
        )

        return results
    }

    private async uploadDescription(): PromiseMaybe<Moment[]> {
        if (!this.memoryId) throw new Error('memoryId is not given')
        const desc = q<HTMLTextAreaElement>('textarea#description-input').value
        const res = await memoryApi.createDescriptionMoment(desc, this.memoryId)
        q<HTMLTextAreaElement>('textarea#description-input').value = ''
        return res
    }

    private initContent(): void {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = ''
        this.renderContent()
        this.attachEvents()
        this.currentFiles = []
    }

    private close(): void {
        this.open = null
        this.initContent()
    }

    private get open(): boolean {
        return this.hasAttribute('open')
    }

    private get memoryId(): Memory['id'] | null {
        return this.getAttribute('memory-id') as Memory['id']
    }

    private set open(val: string | null) {
        if (!val || this.falsyValue.has(val)) {
            this.removeAttribute('open')
            return
        }
        this.setAttribute('open', 'true')
    }
}

export default void customElements.define('add-moment-modal', AddMomentModal)
