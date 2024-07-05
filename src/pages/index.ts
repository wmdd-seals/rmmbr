import './memory-creation-modal'
import { memoryApi, storageApi, userApi } from '#api'
import { createMapWithMarkers, formatDate, q, updateCurrentUserChip } from '#utils'
import { Location } from '#utils'
import { getLocationInfo } from 'src/utils/gmap'
import { Memory } from '#domain'

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

        updateCurrentUserChip(user)

        q('[data-user=name]').innerHTML = user.firstName

        initFilterDrawer()

        const memories = await memoryApi.getAll(user.id)

        renderCountdowns(memories.filter(memory => Date.now() < +new Date(memory.date)))

        const flashbacks = memories.filter(memory => Date.now() - +new Date(memory.date) > 1000 * 60 * 60 * 24 * 365)

        if (flashbacks.length >= 4) {
            // select up to 6 random memories
            renderFlashbacks(flashbacks.sort(() => 0.5 - Math.random()).slice(0, 6))
        }

        renderMemories(memories)

        renderMapMarks(memories)

        const filterBtn = q('#filter-start-btn')

        filterBtn.addEventListener('click', () => filterMemories(memories))
    })
    .catch(console.error)

function renderMemories(memories: Memory[]): void {
    const thumbnail = document.getElementById('memory-thumbnail') as HTMLTemplateElement
    const memoryList = document.getElementById('memory-list') as HTMLUListElement

    ;[...memories]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .forEach(memory => {
            const node = thumbnail.content.cloneNode(true) as HTMLLIElement
            const liElem = node.firstElementChild

            q('[data-memory="title"]', node).innerHTML = memory.title
            q('[data-memory="date"]', node).innerHTML = formatDate(memory.date)
            q<HTMLAnchorElement>('[data-memory="link"]', node).href = `/memory/?id=${memory.id}`
            q<HTMLImageElement>('[data-memory="cover"]', node).src =
                storageApi.getFileUrl(`memory/${memory.id}/cover`) || ''

            if (memory.location) {
                getLocationInfo(memory.location).then(location => {
                    if (!location) return
                    const { country, city } = location
                    q('[data-memory="location"]', <HTMLLIElement>liElem).innerHTML = city
                        ? `in ${city}, ${country}`
                        : `in ${country}`
                }, console.error)
            }

            memoryList.appendChild(node)
        })

    const count = memories.length
    document.querySelectorAll('[data-memory="count"]').forEach(el => {
        el.innerHTML = `${count} ${count === 1 ? 'memory' : 'memories'}`
    })
}

function filterMemories(memories: Memory[]): void {
    const filteredMemories = memories.filter(memory => {
        return filter(memory)
    })

    const memoryList = document.getElementById('memory-list') as HTMLUListElement
    const memoriesArray = Array.from(memoryList.querySelectorAll('li'))
    memoriesArray.forEach(memory => {
        memoryList.removeChild(memory)
    })

    renderMemories(filteredMemories)
}

function filter(memory: Memory): boolean {
    const startDate = q<HTMLInputElement>('#filter-period-start').value
    const endDate = q<HTMLInputElement>('#filter-period-end').value

    if (!startDate) {
        if (!endDate) return true

        return new Date(memory.date) <= new Date(endDate)
    }

    if (!endDate) {
        if (!startDate) return true

        return new Date(startDate) <= new Date(memory.date)
    }

    const memoryDate = new Date(memory.date)
    return new Date(startDate) <= memoryDate && memoryDate <= new Date(endDate)
}

function renderFlashbacks(memories: Memory[]): void {
    const memoryFlashbackList = q('#flashback-list')
    const parent = memoryFlashbackList.parentElement!

    parent.classList.toggle('hidden')
    parent.classList.toggle('flex')

    const memoryFlashbackhTemplate = q<HTMLTemplateElement>('#memory-flashback-thumbnail')

    ;[...memories]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .forEach(memory => {
            const node = memoryFlashbackhTemplate.content.cloneNode(true) as HTMLLIElement

            q('[data-memory=title]', node).innerHTML = memory.title
            q('[data-memory="date"]', node).innerHTML = formatDate(memory.date)
            q<HTMLAnchorElement>('[data-memory=link]', node).href = `/memory/?id=${memory.id}`
            q<HTMLImageElement>('[data-memory=cover]', node).src =
                storageApi.getFileUrl(`memory/${memory.id}/cover`) || ''

            memoryFlashbackList.appendChild(node)
        })
}

function initFilterDrawer(): void {
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
}

function renderCountdowns(memories: Memory[]): void {
    const thumbnail = q<HTMLTemplateElement>('#countdown-thumbnail')
    const countdownList = q<HTMLUListElement>('#countdown-list')

    memories.forEach(memory => {
        const { title } = memory

        const node = thumbnail.content.cloneNode(true) as HTMLLIElement

        q('[data-memory=title]', node).innerHTML = title
        q('[data-memory="date"]', node).innerHTML = formatDate(memory.date)

        countdownList.appendChild(node)
    })
}

function renderMapMarks(memories: Memory[]): void {
    const locations = memories.filter(memory => !!memory.location).map(memory => memory.location!)

    const map = q('#locations-map')

    q('[data-user=locations-count]').innerHTML = `${locations.length} place${locations.length === 1 ? '' : 's'}`

    if (locations.length > 0) {
        q('#map-overlay').style.display = 'none'
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const center: Location = [position.coords.longitude, position.coords.latitude]

            void createMapWithMarkers(map, { center, markers: locations })
        },
        () => {
            void createMapWithMarkers(map, { markers: locations })
        }
    )
}
const inputPlace = q<HTMLInputElement>('#input-place')
inputPlace.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inputPlace.value !== '') {
        renderPlaceOnFilter(inputPlace.value)
        inputPlace.value = ''
    }
    return
})

function renderPlaceOnFilter(value: string): void {
    const button = document.createElement('button')
    button.classList.add('btn-text', 'btn-md', 'border-2', 'btn-sm', 'border-basketball-500', 'border-solid')
    button.innerHTML = `<a>&times;</a> ${value}`
    const renderPlace = q('#render-place')
    renderPlace.appendChild(button)

    const removeSign = button.querySelector('a')
    removeSign!.addEventListener('click', () => {
        button.remove()
    })
}
