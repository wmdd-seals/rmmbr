import { supabase } from 'src/api/supabase'
import { Memory } from '#domain'
import { Location, PromiseMaybe } from '#utils'
import { memoryApi } from 'src/api/memory'
import { ModalBaseLayer } from '../modal-base-layer'

export class MemoryCreationModal extends ModalBaseLayer {
    private inputIndex: number = 0
    public constructor() {
        super()
    }

    protected connectedCallback(): void {
        this.renderBaseLayer()
        // this.renderFirstContent()
        this.renderSecondContent()
    }

    private renderFirstContent(): void {
        ;(this.querySelector('[data-modal-content]') as HTMLElement).innerHTML = /* html */ `
            <header class="flex justify-between text-white w-full sm:text-black">
                <h2 class="text-xl">Create</h2>
                <button id="modal-close-btn" class="text-base w-7">
                    <i class="fa-solid fa-x"></i>
                </button>
            </header>
            <section
                class="flex align-center justify-center items-center flex-col w-full md:w-3/4 sm:max-w-[450px] sm:gap-5"
            >
                <label data-index="0" class="text-base text-white w-full justify-center flex flex-col sm:flex sm:text-black"
                    >Name of the event
                    <input
                        name="title"
                        placeholder="Tell me the memorable moment"
                        type="text"
                        class="input-sm rounded-md text-black sm:border"
                    />
                </label>
                <label data-index="1" class="hidden flex text-base text-white w-full justify-center flex-col sm:flex sm:text-black"
                    >Name of the event
                    <input
                        name="place"
                        placeholder="Where did happen?"
                        type="text"
                        class="input-sm rounded-md text-black sm:border"
                    />
                </label>
                <label data-index="2" class="hidden flex text-base text-white w-full justify-center flex-col sm:flex sm:text-black"
                    >Name of the event
                    <input
                        name="date"
                        placeholder="Put the date"
                        type="date"
                        class="input-sm rounded-md text-black sm:border"
                    />
                </label>
                <div data-index="3" class="hidden flex gap-2 flex-col w-full items-center  sm:flex">
                    <label class="w-full text-white sm:text-black">Description</label>
                    <span class="w-full opacity-80 text-xs text-type-500">Give a brief description of this event</span>
                    <textarea
                        name="description"
                        id="description"
                        class="w-full p-3 sm:border"
                    ></textarea>
                    <ul class="flex flex-col items-center gap-3">
                        <li class="flex items-center justify-between w-full">
                            <label class="flex items-center text-white text-sm sm:text-black" for="cover-photo">Cover photo</label>
                            <input type="file" id="cover-photo" class="hidden" />
                            <button
                                class="border rounded-md text-white text-base py-2 px-4 sm:text-black sm:border-black sm:border-2"
                                id="cover-photo-file-btn"
                            >
                                Select
                            </button>
                        </li>
                        <li class="flex items-center justify-between w-full">
                            <label class="flex items-center text-white text-sm sm:text-black" for="sticker"
                                >Pick a sticker or icon for this event</label
                            >
                            <input type="file" id="sticker" class="hidden" />
                            <button
                                class="border rounded-md text-white text-base py-2 px-4 sm:text-black sm:border-black sm:border-2"
                                id="sticker-file-btn"
                            >
                                Select
                            </button>
                        </li>
                        <li class="flex items-center justify-between w-full">
                            <label class="flex items-center text-white text-sm sm:text-black" for=""
                                >Share your memory of this event among public or friends?</label
                            >
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" class="sr-only peer" />
                                <div
                                    class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                                ></div>
                            </label>
                        </li>
                    </ul>
                </div>
            </section>
            <footer class="flex gap-3 justify-around w-full sm:justify-end">
                <button
                    id="previous"
                    class="flex justify-center rounded-md w-1/2 py-2 text-white text-base border sm:hidden"
                >
                    Cancel
                </button>
                <button id="next" class="flex justify-center rounded-md w-1/2 py-2 bg-white text-base sm:hidden">Next</button>
                <button id="lg-previous" class="hidden rounded-md py-2 px-3 text-base text-white  border sm:flex sm:w-fit sm:border-black sm:text-black">Cancel</button>
                <button id="lg-next" class="hidden rounded-md py-2 px-3 text-base sm:flex sm:w-fit sm:bg-black sm:text-white">Create event</button>
            </footer>
        `

        const changeBtnLabel = (): void => {
            if (this.inputIndex === 0) {
                ;(this.querySelector('#previous') as HTMLButtonElement).textContent = 'Cancel'
            }

            if (this.inputIndex === 1 || this.inputIndex === 2) {
                ;(this.querySelector('#previous') as HTMLButtonElement).textContent = 'Previous'
                ;(this.querySelector('#next') as HTMLButtonElement).textContent = 'Next'
            }

            if (this.inputIndex === 3) {
                ;(this.querySelector('#next') as HTMLButtonElement).textContent = 'Create Event'
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
            if (this.inputIndex > 2) {
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
        ;(this.querySelector('#lg-previous') as HTMLButtonElement).addEventListener('click', () => this.close())
        ;(this.querySelector('#lg-next') as HTMLButtonElement).addEventListener('click', () => handleCreateMemory())
        ;(this.querySelector('#modal-close-btn') as HTMLButtonElement).addEventListener('click', () => this.close())
    }

    private renderSecondContent(): void {
        ;(this.querySelector('[data-modal-content]') as HTMLElement).innerHTML = /* html */ `
            <header class="flex justify-between text-white w-full sm:text-black">
                <h2 class="text-xl">Create</h2>
                <button id="modal-close-btn" class="text-base w-7">
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
                    <i class="fa-solid fa-check text-3xl"></i>
                    <p class="text-sm text-center">Now that you successfully created your event, share it with your friends</p>
                </div>
                <div>
                    <h3>Share with:</h3>
                    <ul data-shared-users>
                        ${/* the shared users here */ ''}
                    </ul>
                </div>
            </section>
            <footer class="flex gap-3 justify-around w-full sm:justify-end">
                <button id="skip" class="
                    rounded-md w-1/2 py-2 px-3 text-white border text-base
                    sm:w-fit sm:text-black
                ">Skip</button>
                <button id="share"class="
                    rounded-md w-1/2 py-2 px-3 bg-white text-base
                    sm:w-fit sm:bg-black sm:text-white
                ">Share</button>
            </footer>
        `
        ;(this.querySelector('#modal-close-btn') as HTMLButtonElement).addEventListener('click', () => this.close())
        ;(this.querySelector('#skip') as HTMLButtonElement).addEventListener('click', () => this.close())
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
        const { data, error } = await supabase.auth.getSession()
        const newMemory = {
            // todo: set the real values for location
            title: (this.querySelector('input[name="title"]') as HTMLInputElement).value,
            location: [0, 0] as Location,
            ownerId: data.session?.user.id as Memory['ownerId'],
            date: (this.querySelector('input[name="date"]') as HTMLInputElement).value
        }

        if (
            error ||
            newMemory.title.length < 1 ||
            newMemory.location.length < 1 ||
            newMemory.ownerId.length < 1 ||
            newMemory.date.length < 1
        ) {
            return
        }

        return memoryApi.create(newMemory)
    }

    protected static get observedAttributes(): string[] {
        return ['open']
    }

    protected attributeChangedCallback(): void {
        console.log('fired')
        //implementation
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
