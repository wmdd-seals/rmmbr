import './memory-creation-modal'

const tabs = {
    ['#home']: document.getElementById('home')!,
    ['#timeline']: document.getElementById('timeline')!,
    ['#memory']: document.getElementById('memory')!
}

const isTab = (hash: string): hash is keyof typeof tabs =>
    hash === '#home' || hash === '#timeline' || hash === '#memory'

let currentTabId: keyof typeof tabs = '#home'

function changeTab(): void {
    const hash = location.hash
    if (hash === currentTabId) return

    // toggle previous tab
    tabs[currentTabId].classList.toggle('hidden')

    currentTabId = isTab(hash) ? hash : '#home'

    tabs[currentTabId].classList.toggle('hidden')
}

changeTab()

customElements
    .whenDefined('memory-creation-modal')
    .then(() => {
        document.querySelector('#create-memory-btn')?.addEventListener('click', ev => {
            ev.preventDefault()
            document.querySelector('memory-creation-modal')?.setAttribute('open', 'true')
        })
    })
    .catch(err => {
        console.error(err)
    })

window.addEventListener('hashchange', changeTab)
