import { supabase } from 'src/api/supabase'
import { Memory } from '#domain'
import { Autocomplete, codeAddress, Location, PromiseMaybe } from '#utils'
import { memoryApi } from 'src/api/memory'
import { ModalBaseLayer } from '../../components/modal-base-layer'

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

class MemoryCreationModal extends ModalBaseLayer {
    private inputIndex: number = 0
    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.renderBaseLayer()
        this.renderFirstContent()
    }

    private renderFirstContent(): void {
        ;(this.querySelector('[data-modal-content]') as HTMLElement).innerHTML = /* html */ `
            <header class="flex justify-between font-bold w-full text-black">
                <h2 class="text-2xl">Create</h2>
                <button id="modal-close-btn" class="text-lg text-basketball-500 w-7">
                    <i class="fa-solid fa-x"></i>
                </button>
            </header>
            <section
                class="flex align-center justify-center items-center flex-col w-full h-full md:w-3/4 sm:max-w-[450px] sm:gap-5"
            >
                <div data-index="0" class="flex w-full flex-col items-center justify-center flex-grow">
                    <label class="text-base w-full justify-center flex flex-col gap-2 text-black my-auto"
                    >Name of the event
                        <input
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
                <button id="previous" class="flex justify-center rounded-[80px] w-1/2 py-2 text-black text-base sm:w-fit sm:px-8">Cancel</button>
                <button id="next" class="flex justify-center rounded-[80px] w-1/2 py-2 bg-basketball-500 text-white text-base sm:w-fit sm:px-8">Continue</button>

            </footer>
        `

        new Autocomplete(document.querySelector('input[name="place"]') as HTMLInputElement)

        const changeBtnLabel = (): void => {
            if (this.inputIndex === 0) {
                ;(this.querySelector('#previous') as HTMLButtonElement).textContent = 'Cancel'
            }

            if (this.inputIndex === 1) {
                ;(this.querySelector('#previous') as HTMLButtonElement).textContent = 'Previous'
                ;(this.querySelector('#next') as HTMLButtonElement).textContent = 'Continue'
            }

            if (this.inputIndex === 2) {
                ;(this.querySelector('#next') as HTMLButtonElement).textContent = 'Create event'
            }
        }

        const handleCreateMemory = (): void => {
            this.createMemory()
                .then(res => {
                    if (!res) {
                        return
                    }
                    this.renderSecondContent()
                })
                .catch(err => {
                    console.error(err)
                })
        }

        const goPreviousHandler = (ev: MouseEvent): void => {
            ev.preventDefault()
            if (this.inputIndex < 1) {
                this.close()
            } else {
                this.querySelector(`[data-index="${this.inputIndex}"]`)?.classList.toggle('hidden')
                this.inputIndex -= 1
                this.querySelector(`[data-index="${this.inputIndex}"]`)?.classList.toggle('hidden')
            }

            changeBtnLabel()

            return
        }

        const goNextHandler = (ev: MouseEvent): void => {
            ev.preventDefault()
            if (this.inputIndex > 1) {
                handleCreateMemory()
            } else {
                this.querySelector(`[data-index="${this.inputIndex}"]`)?.classList.toggle('hidden')
                this.inputIndex += 1
                this.querySelector(`[data-index="${this.inputIndex}"]`)?.classList.toggle('hidden')
            }

            changeBtnLabel()

            return
        }

        ;(this.querySelector('#previous') as HTMLButtonElement).addEventListener('click', goPreviousHandler)
        ;(this.querySelector('#next') as HTMLButtonElement).addEventListener('click', goNextHandler)
        ;(this.querySelector('#modal-close-btn') as HTMLButtonElement).addEventListener('click', () => this.close())
    }

    private renderSecondContent(): void {
        ;(this.querySelector('[data-modal-content]') as HTMLElement).innerHTML = /* html */ `
            <header class="flex justify-between font-bold w-full text-black">
                <h2 class="text-2xl">Create</h2>
                <button id="modal-close-btn" class="text-lg text-basketball-500 w-7">
                    <i class="fa-solid fa-x"></i>
                </button>
            </header>
            <section
                class="flex align-center justify-center items-center flex-col w-full sm:max-w-[700px] sm:gap-5"
            >
                <div class="
                    flex w-full flex-col px-4 py-9 gap-3 bg-ui-200 bg-opacity-20 text-white items-center rounded-xl
                    sm:text-black
                ">
                    <i class="fa-solid fa-check text-3xl text-basketball-500"></i>
                    <p class="text-sm text-center text-basketball-500">Awesome!<br>Your event is created.<br><span class="text-type-300">Share the fun with friends!</span></p>
                </div>
                <div>
                    <h3>Share with:</h3>
                    <ul data-shared-users>
                        ${/* the shared users here */ ''}
                    </ul>
                </div>
            </section>
            <footer class="flex gap-3 justify-around w-full sm:justify-end">
                here would be the share link
            </footer>
        `
        ;(this.querySelector('#modal-close-btn') as HTMLButtonElement).addEventListener('click', () => this.close())
    }

    private close(): void {
        this.open = null
        this.reset()
    }

    private reset(): void {
        this.renderFirstContent()
        this.inputIndex = 0
    }

    private async createMemory(): PromiseMaybe<Memory | void> {
        const location = await codeAddress((document.querySelector('input[name="place"]') as HTMLInputElement).value)

        const { data, error } = await supabase.auth.getSession()
        const newMemory = {
            title: (this.querySelector('input[name="title"]') as HTMLInputElement).value,
            location: location ? ([location.lng(), location.lat()] as Location) : null,
            ownerId: data.session?.user.id as Memory['ownerId'],
            date: (this.querySelector('input[name="date"]') as HTMLInputElement).value
        }

        if (error || newMemory.title.length < 1 || newMemory.ownerId.length < 1 || newMemory.date.length < 1) {
            return
        }

        return memoryApi.create(newMemory)
    }

    protected static get observedAttributes(): string[] {
        return ['open']
    }

    protected attributeChangedCallback(): void {
        this.querySelector('[data-modal-base]')?.classList.toggle('hidden')
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
