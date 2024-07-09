import { Memory } from '#domain'
import { Location, PromiseMaybe, initAutoComplete, codeAddress, q } from '#utils'
import { memoryApi } from 'src/api/memory'
import { userApi } from '#api'
import { ModalBaseLayer } from '../components/modal-base-layer'
import './share-memory-window'

const explanations = {
    title: {
        heading: 'Give it a title:',
        msg: 'Choose a name that captures the essence of your experience. Is it a birthday party, a concert, or a vacation getaway?'
    },
    date: {
        heading: 'Pick a date:',
        msg: "Select the date for your event. If it's happening in the future, it'll be a countdown you can look forward to! If it's already happened, it'll become a cherished memory you can revisit."
    },
    detail: {
        heading: 'Add details (optional):',
        msg: "Feel free to write a description to bring your memory or event to life. You can also include the location if you'd like to remember where it took place."
    }
}

const paginationBtnLabel = [
    {
        previous: 'Cancel',
        next: 'Continue'
    },
    {
        previous: 'Previous',
        next: 'Continue'
    },
    {
        previous: 'Previous',
        next: 'Create event'
    }
]

class MemoryCreationModal extends ModalBaseLayer {
    private inputIndex: number = 0
    private memory: Memory | null = null
    public constructor() {
        super()
    }

    protected async connectedCallback(): Promise<void> {
        this.renderBaseLayer()
        await this.renderFirstContent()
        this.attachValidationListeners()
    }

    private async renderFirstContent(): Promise<void> {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = `
            <header class="flex justify-between font-bold w-full text-black">
                <h2 class="text-2xl">Create</h2>
                <button id="modal-close-btn" class="text-basketball-500 text-3xl">
                    &#10005;
                </button>
            </header>
            <section
                class="flex align-center justify-center items-center flex-col w-full h-full md:w-3/4 sm:max-w-[28rem] sm:gap-5"
            >
                <div data-index="0" class="flex w-full flex-col items-center justify-center flex-grow">
                    <label class="text-base w-full justify-center flex flex-col gap-2 text-black my-auto"
                    >Name of the event
                        <input
                            required
                            name="title"
                            placeholder="Tell me the memorable moment"
                            type="text"
                            class="input-sm rounded-md text-black border-2 border-ui-500 bg-ui-50"
                        />
                    </label>
                    <div class="relative flex flex-col items-start justify-center h-fit w-full p-4 bg-ui-50 border-ui-150 border rounded-lg mb-6">
                        <span class="bg-basketball-500 rounded-full h-6 w-6 text-white flex justify-center items-center absolute top-0 left-4 -translate-y-1/2">1</span>
                        <h4 class="text-lg font-bold">${explanations.title.heading}</h4>
                        <p class="text-base">${explanations.title.msg}</p>

                    </div>
                </div>
                <div data-index="1" class="hidden flex w-full flex-col items-center justify-center flex-grow">
                    <label class="flex text-base w-full justify-center flex-col gap-2 text-black my-auto"
                    >Date of the event
                        <input
                            required
                            name="date"
                            placeholder="Put the date"
                            type="date"
                            class="input-sm rounded-md text-black border-2 border-ui-500 bg-ui-50"
                        />
                    </label>
                    <div class="relative flex flex-col items-start justify-center h-fit w-full p-4 bg-ui-50 border-ui-150 border rounded-lg mb-6">
                        <span class="bg-basketball-500 rounded-full h-6 w-6 text-white flex justify-center items-center absolute top-0 left-4 -translate-y-1/2">2</span>
                        <h4 class="text-lg font-bold">${explanations.date.heading}</h4>
                        <p class="text-base">${explanations.date.msg}</p>

                    </div>
                </div>
                <div data-index="2" class="hidden flex gap-9 flex-col w-full items-center flex-grow">
                    <label class="flex flex-col w-full gap-2 text-black mt-auto">
                        Description
                        <span class="w-full opacity-80 text-xs text-type-500">Give a brief description of this event</span>
                        <textarea
                            required
                            name="description"
                            id="description"
                            class="w-full p-3 rounded-md border-2 border-ui-500 bg-ui-50"
                        ></textarea>
                    </label>
                    <label class="flex flex-col gap-2 text-base w-full justify-center  text-black mb-auto"
                    >Location
                        <input
                            name="place"
                            placeholder="Where did happen?"
                            type="text"
                            class="input-sm rounded-md text-black border-2 border-ui-500 bg-ui-50"
                        />
                    </label>
                    <div class="relative flex flex-col items-start justify-center h-fit w-full p-4 bg-ui-50 border-ui-150 border rounded-lg mb-6">
                        <span class="bg-basketball-500 rounded-full h-6 w-6 text-white flex justify-center items-center absolute top-0 left-4 -translate-y-1/2">3</span>
                        <h4 class="text-lg font-bold">${explanations.detail.heading}</h4>
                        <p class="text-base">${explanations.detail.msg}</p>

                    </div>
                </div>
            </section>
            <footer class="flex gap-3 justify-around w-full sm:justify-end">
                <button id="previous" class="flex justify-center rounded-[5rem] w-1/2 py-2 text-black text-base sm:w-fit sm:px-8">Cancel</button>
                <button id="next" class="flex justify-center rounded-[5rem] w-1/2 py-2 bg-basketball-500 text-white text-base sm:w-fit sm:px-8 disabled:opacity-50" disabled>Continue</button>

            </footer>
        `

        await initAutoComplete(q<HTMLInputElement>('input[name="place"]'))

        const changeBtnLabel = (): void => {
            q<HTMLButtonElement>('#previous', this).textContent = paginationBtnLabel[this.inputIndex].previous
            q<HTMLButtonElement>('#next', this).textContent = paginationBtnLabel[this.inputIndex].next
        }

        const handleCreateMemory = (): void => {
            this.createMemory()
                .then(memory => {
                    if (!memory) {
                        return
                    }
                    this.memory = memory
                    this.renderSecondContent()
                })
                .catch(err => {
                    console.error(err)
                })
        }

        const goPreviousHandler = async (ev: MouseEvent): Promise<void> => {
            ev.preventDefault()
            if (this.inputIndex < 1) {
                await this.close()
            } else {
                q<HTMLDivElement>(`[data-index="${this.inputIndex}"]`, this).classList.toggle('hidden')
                this.inputIndex -= 1
                q<HTMLDivElement>(`[data-index="${this.inputIndex}"]`, this).classList.toggle('hidden')
                q<HTMLButtonElement>('#next', this).disabled = !this.areAllRequiredFieldsFilled()
                this.attachValidationListeners()
            }

            changeBtnLabel()
        }

        const goNextHandler = (ev: MouseEvent): void => {
            ev.preventDefault()
            if (this.inputIndex > 1) {
                handleCreateMemory()
            } else {
                if (!this.areAllRequiredFieldsFilled()) return
                q<HTMLDivElement>(`[data-index="${this.inputIndex}"]`, this).classList.toggle('hidden')
                this.inputIndex += 1
                q<HTMLDivElement>(`[data-index="${this.inputIndex}"]`, this).classList.toggle('hidden')
                q<HTMLButtonElement>('#next', this).disabled = !this.areAllRequiredFieldsFilled()
                this.attachValidationListeners()
            }

            changeBtnLabel()
        }

        q<HTMLButtonElement>('#previous', this).addEventListener('click', goPreviousHandler)
        q<HTMLButtonElement>('#next', this).addEventListener('click', goNextHandler)
        q<HTMLButtonElement>('#modal-close-btn', this).addEventListener('click', () => this.close())
    }

    private areAllRequiredFieldsFilled(): boolean {
        return Array.from(
            this.querySelectorAll(
                `[data-index="${this.inputIndex}"] input[required],
                [data-index="${this.inputIndex}"] textarea[required]`
            )
        ).every(e => (e as HTMLInputElement | HTMLTextAreaElement).value)
    }

    private attachValidationListeners(): void {
        this.querySelectorAll(
            `[data-index="${this.inputIndex}"] input[required],
            [data-index="${this.inputIndex}"] textarea[required]`
        ).forEach(e =>
            e.addEventListener('input', ev => {
                ev.preventDefault()
                q<HTMLButtonElement>('#next', this).disabled = !this.areAllRequiredFieldsFilled()
            })
        )
    }

    private renderSecondContent(): void {
        q<HTMLDivElement>('[data-modal-content]', this).innerHTML = `
            <header class="flex justify-between font-bold w-full text-black h-fit">
                <h2 class="text-2xl text-slate-800">Create</h2>
                <button id="modal-close-btn" class="text-basketball-500 text-3xl">
                    &#10005;
                </button>
            </header>
            <section
                class="flex flex-col flex-grow align-center overflow-hidden justify-start items-center w-full sm:max-w-[43.75rem] sm:gap-5"
            >
                <div class="
                    flex w-full flex-col px-4 py-9 gap-3 bg-opacity-20 text-white justify-center items-center rounded-xl h-[30%]
                    sm:text-black
                ">
                    <i class="fa-solid fa-check text-3xl text-basketball-500"></i>
                    <p class="text-lg text-center text-basketball-600">Awesome!<br>Your event is created.<br><span class="text-slate-600">Share the fun with friends!</span></p>
                </div>
                <div class="w-full flex flex-col flex-grow items-center justify-start h-[70%]">
                    <h3 class="h-[1.8rem] w-full text-left text-slate-900 text-sm">Add contributers to your event</h3>
                    <share-memory-window memory-id new-memory="true" class="w-full h-[calc(100%-1.8rem)]"></share-memory-window>
                </div>
            </section>
        `

        const shareMemoryWindow = q<HTMLElement>('share-memory-window', this)
        shareMemoryWindow.setAttribute('memory-id', this.memory!.id)
        shareMemoryWindow.setAttribute('memory-owner-id', this.memory!.ownerId)
        q<HTMLButtonElement>('#modal-close-btn', this).addEventListener('click', () => this.close())
    }

    private async close(): Promise<void> {
        this.open = null
        await this.reset()
    }

    private async reset(): Promise<void> {
        await this.renderFirstContent()
        this.inputIndex = 0
        this.memory = null
    }

    private async createMemory(): PromiseMaybe<Memory> {
        const location = await codeAddress(q<HTMLInputElement>('input[name="place"]', this).value)

        const currentUser = await userApi.getCurrent()
        if (!currentUser) {
            return
        }

        const newMemory = {
            title: q<HTMLInputElement>('input[name="title"]', this).value,
            location: location ? ([location[0], location[1]] as Location) : null,
            ownerId: currentUser.id,
            description: q<HTMLTextAreaElement>('textarea#description', this).value,
            date: q<HTMLInputElement>('input[name="date"]', this).value
        }

        if (newMemory.title.length < 1 || newMemory.ownerId.length < 1 || newMemory.date.length < 1) {
            return
        }

        return memoryApi.create(newMemory)
    }

    protected static get observedAttributes(): string[] {
        return ['open']
    }

    protected attributeChangedCallback(): void {
        q<HTMLDivElement>('[data-modal-base]', this).classList.toggle('hidden')
    }

    public get open(): boolean {
        return this.hasAttribute('open')
    }

    public set open(val: string | null) {
        if (!val || ['false', 'null', '0', '', null].includes(val)) {
            this.removeAttribute('open')
            return
        }
        this.setAttribute('open', 'true')
    }
}

export default void customElements.define('memory-creation-modal', MemoryCreationModal)
