import './memory-creation-modal'
import { memoryApi, supabase } from '#api'
import { User } from '#domain'

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

supabase.auth
    .getUser()
    .then(async user => {
        if (!user.data.user) {
            return
        }

        const memories = await memoryApi.getAll(user.data.user.id as User['id'])
        const count = memories.length

        document.querySelectorAll('[data-memory="count"]').forEach(el => {
            el.innerHTML = `${count} ${count === 1 ? 'memory' : 'memories'}`
        })

        const thumbnail = document.getElementById('memory-thumbnail') as HTMLTemplateElement
        const memoryList = document.getElementById('memory-list') as HTMLUListElement

        memories.forEach(mem => {
            const node = thumbnail.content.cloneNode(true) as HTMLLIElement

            node.querySelector('[data-memory="title"]')!.innerHTML = mem.title
            ;(node.querySelector('[data-memory="link"]') as HTMLAnchorElement).href = `/memory/?id=${mem.id}`

            memoryList.appendChild(node)
        })
    })
    .catch(console.error)
