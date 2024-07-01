import './memory-creation-modal'
import { memoryApi, storageApi, userApi } from '#api'
import { q } from '#utils'

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

window.addEventListener('hashchange', changeTab)

customElements
    .whenDefined('memory-creation-modal')
    .then(() => {
        q('#create-memory-btn').addEventListener('click', ev => {
            ev.preventDefault()
            q('memory-creation-modal').setAttribute('open', 'true')
        })
    })
    .catch(console.error)

userApi
    .getCurrent()
    .then(async user => {
        if (!user) {
            return
        }

        q('[data-user=name]').innerHTML = user.firstName
        q<HTMLImageElement>('[data-user=avatar]').src = user.avatarSrc || ''

        const memories = await memoryApi.getAll(user.id)
        const count = memories.length
        const memoryFlashbackList = q('#flashback-list')
        const memoryFlashbackhTemplate = q<HTMLTemplateElement>('#memory-flashback-thumbnail')

        memories.forEach(mem => {
            const node = memoryFlashbackhTemplate.content.cloneNode(true) as HTMLLIElement

            q('[data-memory=title]', node).innerHTML = mem.title

            memoryFlashbackList.appendChild(node)
        })

        document.querySelectorAll('[data-memory="count"]').forEach(el => {
            el.innerHTML = `${count} ${count === 1 ? 'memory' : 'memories'}`
        })

        const thumbnail = document.getElementById('memory-thumbnail') as HTMLTemplateElement
        const memoryList = document.getElementById('memory-list') as HTMLUListElement

        memories.forEach(mem => {
            const node = thumbnail.content.cloneNode(true) as HTMLLIElement

            q('[data-memory="title"]', node).innerHTML = mem.title
            q<HTMLAnchorElement>('[data-memory="link"]', node).href = `/memory/?id=${mem.id}`
            q<HTMLImageElement>('[data-memory=cover]', node).src = storageApi.getFileUrl(`memory/${mem.id}/cover`) || ''

            memoryList.appendChild(node)
        })

        let filtersOpen = false

        q('#filter-btn').addEventListener('click', () => {
            if (filtersOpen) return

            const drawer = q('#filter-drawer')

            const el = document.createElement('div')
            el.classList.add('fixed', 'z-20', 'inset-0', 'transition-all', 'duration-300')
            document.body.prepend(el)

            // allow reflow/repaint browser events to happen
            setTimeout(() => el.classList.add('backdrop-blur', 'bg-black', 'bg-opacity-65'))

            el.addEventListener('click', () => {
                if (!filtersOpen) return

                el.classList.remove('backdrop-blur', 'bg-black', 'bg-opacity-65')
                setTimeout(() => document.body.removeChild(el), 300)
                drawer.style.transform = 'translateX(100%)'
                filtersOpen = false
            })

            drawer.style.transform = 'translateX(0)'

            filtersOpen = true
        })
    })
    .catch(console.error)
