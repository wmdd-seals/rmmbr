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
            <div data-modal-base class="hidden flex fixed top-0 left-0 bg-black bg-opacity-80 h-screen w-screen justify-center items-center z-10">
                <div data-modal-content class="
                    flex z-20 flex-col justify-between items-center
                    w-11/12 h-[95%] px-8 py-10 bg-white rounded-2xl
                    sm:w-3/5 sm:h-[90%] sm:max-w-[56rem]
                "></div>
            </div>
        `
    }
}
