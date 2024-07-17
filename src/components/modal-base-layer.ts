export class ModalBaseLayer extends HTMLElement {
    public constructor() {
        super()
    }

    protected renderBaseLayer(): void {
        this.innerHTML = `
            <style>
                body:has(div[data-modal-base]:not(.hidden)) {
                    overflow: hidden
                }
            </style>

            <div data-modal-base class="hidden flex fixed inset-0 bg-black bg-opacity-80 justify-center items-end z-10">
                <div data-modal-content class="flex z-20 flex-col items-center overflow-hidden w-11/12 h-[80%] mb-[5%] p-6 bg-white rounded-2xl sm:w-3/5 sm:max-w-[56rem]"></div>
            </div>
        `
    }
}
