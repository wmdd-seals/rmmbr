import './memory-creation-modal'
import { memoryApi, storageApi, userApi } from '#api'
import { createMapWithMarkers, formatDate, q, updateCurrentUserChip } from '#utils'
import { Location } from '#utils'
import { getLocationInfo } from 'src/utils/gmap'
import { Memory, FilterCriteria } from '#domain'

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

        const memories = await memoryApi.getAll(user.id)

        initFilterDrawer(memories)

        renderCountdowns(memories.filter(memory => Date.now() < +new Date(memory.date)))

        const flashbacks = memories.filter(memory => Date.now() - +new Date(memory.date) > 1000 * 60 * 60 * 24 * 365)

        if (flashbacks.length >= 4) {
            // select up to 6 random memories
            renderFlashbacks(flashbacks.sort(() => 0.5 - Math.random()).slice(0, 6))
        }

        renderMemories(memories)

        renderMapMarks(memories)
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

function initFilterDrawer(memories: Memory[]): void {
    let filtersOpen = false
    let el: HTMLDivElement | null = null

    q('#filter-btn').addEventListener('click', () => {
        if (filtersOpen) return

        const drawer = q('#filter-drawer')

        el = document.createElement('div')
        el.classList.add('fixed', 'z-20', 'inset-0', 'transition-all', 'duration-300')
        document.body.prepend(el)

        // allow reflow/repaint browser events to happen
        setTimeout(() => el!.classList.add('backdrop-blur', 'bg-black', 'bg-opacity-65'))

        const filterBtn = q('#filter-start-btn')
        const closeBtn = q('#close-drawer-btn')
        const triggerCloseDrawer = [el, closeBtn, filterBtn]

        triggerCloseDrawer.forEach(each => {
            each.addEventListener('click', () => {
                if (!filtersOpen) return

                el!.classList.remove('backdrop-blur', 'bg-black', 'bg-opacity-65')
                setTimeout(() => document.body.removeChild(el!), 300)
                drawer.classList.add('!translate-x-full')

                filtersOpen = false
            })
        })

        drawer.classList.remove('!translate-x-full')

        filtersOpen = true
    })

    renderCategoriesOnFilter(memories)
    renderLocationsOnFilter(memories)

    const filterCriteria: FilterCriteria = {
        categories: [],
        startDate: '',
        endDate: '',
        locations: [],
        collaborators: []
    }

    const selectElements = [
        { selectElemId: '#input-categories', filterCriteria: filterCriteria.categories },
        { selectElemId: '#input-locations', filterCriteria: filterCriteria.locations },
        { selectElemId: '#input-collaborators', filterCriteria: filterCriteria.collaborators }
    ]

    selectElements.forEach(element => {
        q(element.selectElemId).addEventListener('change', () => {
            const selectElem = q<HTMLSelectElement>(element.selectElemId)
            const selectedOption = selectElem.options[selectElem.selectedIndex]
            const value = selectedOption.value

            if (element.filterCriteria.includes(value)) return
            element.filterCriteria.push(value)
            showLabelOnFilter(selectElem, value, element.filterCriteria)
            selectElem.value = ''
        })
    })

    const filterBtn = q('#filter-start-btn')

    filterBtn.addEventListener('click', () => {
        filterCriteria.startDate = q<HTMLInputElement>('#filter-start-date').value
        filterCriteria.endDate = q<HTMLInputElement>('#filter-end-date').value

        filterMemories(memories, filterCriteria)
        showLabelOnHomePage(memories, filterCriteria)
    })
}

function filterMemories(memories: Memory[], filterCriteria: FilterCriteria): void {
    const filteredMemories = memories.filter(memory => {
        return (
            filterByCategory(memory, filterCriteria) &&
            filterByDate(memory, filterCriteria) &&
            filterByLocation(memory, filterCriteria)
        )
    })

    const memoryList = document.getElementById('memory-list') as HTMLUListElement
    const memoriesArray = Array.from(memoryList.querySelectorAll('li'))
    memoriesArray.forEach(memory => {
        memoryList.removeChild(memory)
    })

    renderMemories(filteredMemories)
}

function filterByCategory(memory: Memory, filterCriteria: FilterCriteria): boolean {
    if (filterCriteria.categories.length === 0) return true
    return memory.categories.some(
        memoryCategory => memoryCategory && filterCriteria.categories.includes(memoryCategory)
    )
}

function filterByDate(memory: Memory, filterCriteria: FilterCriteria): boolean {
    const startDateLocal = filterCriteria.startDate ? new Date(filterCriteria.startDate) : null
    const endDateLocal = filterCriteria.endDate ? new Date(filterCriteria.endDate) : null

    const startDateUtc = startDateLocal
        ? new Date(startDateLocal.getTime() - startDateLocal.getTimezoneOffset() * 60000)
        : null
    const endDateUtc = endDateLocal ? new Date(endDateLocal.getTime() - endDateLocal.getTimezoneOffset() * 60000) : null

    const memoryDateUtc = new Date(memory.date)

    if (!startDateUtc) {
        if (!endDateUtc) return true

        return memoryDateUtc <= endDateUtc
    }

    if (!endDateUtc) {
        return startDateUtc <= memoryDateUtc
    }

    return startDateUtc <= memoryDateUtc && memoryDateUtc <= endDateUtc
}

function filterByLocation(memory: Memory, filterCriteria: FilterCriteria): boolean {
    if (filterCriteria.locations.length === 0) return true

    const memoryCountry = locationCountryMap.get(JSON.stringify(memory.location))
    return filterCriteria.locations.includes(memoryCountry!)
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

function renderCategoriesOnFilter(memories: Memory[]): void {
    if (memories.length === 0) return

    const categorySet: Set<string> = new Set()
    memories.forEach(memory => {
        memory.categories.forEach(category => {
            if (category) {
                categorySet.add(category)
            }
        })
    })

    renderDropdownMenu(categorySet, 'input-categories')
}

const locationCountryMap = new Map<string, string>()

function renderLocationsOnFilter(memories: Memory[]): void {
    const locationPromises = memories
        .filter(memory => !!memory.location)
        .map(memory => getLocationInfo(memory.location!))

    Promise.all(locationPromises)
        .then(locations => {
            const countrySet: Set<string> = new Set()

            locations.forEach((location, index) => {
                if (location) {
                    const { country } = location
                    countrySet.add(country)

                    const memoryWithLocation = memories.filter(memory => !!memory.location)[index]
                    const latitudeAndLongitude = JSON.stringify(memoryWithLocation.location)
                    locationCountryMap.set(latitudeAndLongitude, country)
                }
            })

            renderDropdownMenu(countrySet, 'input-locations')
        })
        .catch(console.error)
}

function renderDropdownMenu(values: Set<string>, selectElemId: string): void {
    const dropdown = document.getElementById(selectElemId) as HTMLSelectElement
    values.forEach(value => {
        const option = document.createElement('option')
        option.value = value
        option.text = value
        dropdown.appendChild(option)
    })
}

export function showLabelOnFilter(selectElem: HTMLSelectElement, value: string, filterCriteria: string[]): void {
    const label = document.createElement('div')
    label.classList.add('btn-text', 'btn-md', 'border-2', 'btn-sm', 'border-basketball-500', 'border-solid')
    label.setAttribute('data-label', 'filter-label')
    label.innerHTML = `${value} <button class='text-lg'>&times;</button>`

    const space = selectElem.nextElementSibling!
    space.appendChild(label)

    const removeButton = label.querySelector('button')
    removeButton!.addEventListener('click', () => {
        label.remove()
        const index = filterCriteria.indexOf(value)
        if (index > -1) {
            filterCriteria.splice(index, 1)
        }
        selectElem.value = ''
    })
}

function showLabelOnHomePage(memories: Memory[], filterCriteria: FilterCriteria): void {
    const displayDiv = q('[data-label="show-after-filter"]')
    displayDiv.innerHTML = ''

    for (const key in filterCriteria) {
        const value = filterCriteria[key as keyof FilterCriteria]

        if (key === 'startDate' || key === 'endDate') {
            if (value !== '') {
                createLabelOnHomePage(
                    value as string,
                    key as keyof FilterCriteria,
                    filterCriteria,
                    memories,
                    displayDiv
                )
            }
        } else {
            ;(value as string[]).forEach(val => {
                if (val !== '') {
                    createLabelOnHomePage(val, key as keyof FilterCriteria, filterCriteria, memories, displayDiv)
                }
            })
        }
    }
}

function createLabelOnHomePage(
    value: string,
    key: keyof FilterCriteria,
    filterCriteria: FilterCriteria,
    memories: Memory[],
    displayDiv: HTMLElement
): void {
    const closeButton = `<button class='text-lg'>&times;</button>`
    let labelContent = ''

    if (key === 'startDate' || key === 'endDate') {
        labelContent = `${key === 'startDate' ? `from ${value}` : `to ${value}`} ${closeButton}`
    } else {
        labelContent = `${value} ${closeButton}`
    }

    const label = document.createElement('div')
    label.classList.add('btn-text', 'btn-md', 'border-2', 'btn-sm', 'border-basketball-500', 'border-solid')
    label.innerHTML = labelContent
    displayDiv.appendChild(label)

    const removeButton = label.querySelector('button')
    removeButton!.addEventListener('click', () => {
        label.remove()

        if (key === 'startDate' || key === 'endDate') {
            const inputFieldId = key === 'startDate' ? '#filter-start-date' : '#filter-end-date'
            q<HTMLInputElement>(inputFieldId).value = ''
        } else {
            const selectElement = q<HTMLSelectElement>(`select[name="${key}"]`)
            const optionToDeselect = Array.from(selectElement.options).find(option => option.value === value)
            optionToDeselect!.selected = false
        }

        const labelsOnFilter = document.querySelectorAll('[data-label="filter-label"]')
        labelsOnFilter.forEach(labelOnFilter => {
            if (labelOnFilter.textContent!.includes(value)) {
                labelOnFilter.remove()
            }
        })

        if (key === 'startDate' || key === 'endDate') {
            filterCriteria[key] = ''
        } else {
            const criteria = filterCriteria[key]
            const index = criteria.indexOf(value)
            if (index !== -1) {
                criteria.splice(index, 1)
            }
        }
        filterMemories(memories, filterCriteria)
    })
}
