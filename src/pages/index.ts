import './memory-creation-modal'
import { memoryApi, storageApi, userApi } from '#api'
import { createMapWithMarkers, formatDate, q, SelectedValue, updateCurrentUserChip } from '#utils'
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

    // Open and close the filter drawer
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
                drawer.setAttribute('aria-selected', 'true')

                filtersOpen = false
            })
        })

        drawer.removeAttribute('aria-selected')

        filtersOpen = true
    })

    renderCategoriesOnFilter(memories)
    renderLocationsOnFilter(memories)

    // When users select a value from dropdown, the label with the value will be displayed and the value gets added the array of selected values.
    const selectedValues: SelectedValue = {
        categories: [],
        startDate: [],
        endDate: [],
        locations: [],
        collaborators: []
    }

    const selectElements = [
        { selectElemId: '#input-categories', selectedValues: selectedValues.categories },
        { selectElemId: '#input-locations', selectedValues: selectedValues.locations },
        { selectElemId: '#input-collaborators', selectedValues: selectedValues.collaborators }
    ]

    selectElements.forEach(element => {
        q(element.selectElemId).addEventListener('change', () => {
            const selectElem = q<HTMLSelectElement>(element.selectElemId)
            const selectedOption = selectElem.options[selectElem.selectedIndex]
            const value = selectedOption.value

            if (element.selectedValues.includes(value)) return
            element.selectedValues.push(value)
            showLabelOnFilter(selectElem, value, element.selectedValues)
            selectElem.value = ''
        })
    })

    // When users click the "Filter" button, filtering process starts.
    const filterBtn = q('#filter-start-btn')

    filterBtn.addEventListener('click', () => {
        selectedValues.startDate[0] = q<HTMLInputElement>('#filter-start-date').value
        selectedValues.endDate[0] = q<HTMLInputElement>('#filter-end-date').value

        filterMemories(memories, selectedValues)
        showLabelOnHomePage(memories, selectedValues)
    })
}

function filterMemories(memories: Memory[], selectedValues: SelectedValue): void {
    const filteredMemories = memories.filter(memory => {
        return (
            filterByCategory(memory, selectedValues) &&
            filterByDate(memory, selectedValues) &&
            filterByLocation(memory, selectedValues)
        )
    })

    // Clear the previously rendred memories
    const memoryList = document.getElementById('memory-list') as HTMLUListElement
    const memoriesArray = Array.from(memoryList.querySelectorAll('li'))
    memoriesArray.forEach(memory => {
        memoryList.removeChild(memory)
    })

    renderMemories(filteredMemories)
}

function filterByCategory(memory: Memory, selectedValues: SelectedValue): boolean {
    if (selectedValues.categories.length === 0) return true
    if (!memory.category) return false

    return memory.category.some(memoryCategory => memoryCategory && selectedValues.categories.includes(memoryCategory))
}

function filterByDate(memory: Memory, selectedValues: SelectedValue): boolean {
    const startDateLocal = selectedValues.startDate[0] ? new Date(selectedValues.startDate[0]) : null
    const endDateLocal = selectedValues.endDate[0] ? new Date(selectedValues.endDate[0]) : null

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

function filterByLocation(memory: Memory, selectedValues: SelectedValue): boolean {
    if (selectedValues.locations.length === 0) return true

    const memoryCountry = locationCountryMap.get(JSON.stringify(memory.location))
    return selectedValues.locations.includes(memoryCountry!)
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
    const categorySet: Set<string> = new Set()

    memories.forEach(memory => {
        memory.category?.forEach(category => {
            if (!category) return
            categorySet.add(category)
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

function showLabelOnFilter(selectElem: HTMLSelectElement, value: string, selectedValues: string[]): void {
    const label = document.createElement('button')
    label.classList.add('btn-text', 'btn-md', 'border-2', 'btn-sm', 'border-basketball-500', 'border-solid')
    label.setAttribute('data-label', 'filter-label')
    label.innerHTML = `${value} <a class='text-lg'>&times;</a> `

    const space = selectElem.nextElementSibling!
    space.appendChild(label)

    const removeSign = label.querySelector('a')
    removeSign!.addEventListener('click', () => {
        label.remove()
        selectedValues.splice(selectedValues.indexOf(value), 1)
    })
}

function showLabelOnHomePage(memories: Memory[], selectedValues: SelectedValue): void {
    const displayDiv = q('[data-label="show-after-filter"]')
    displayDiv.innerHTML = ''

    for (const key in selectedValues) {
        selectedValues[key as keyof SelectedValue].forEach(value => {
            if (value === selectedValues.startDate[0] && selectedValues.startDate[0] === '') {
                return
            }
            if (value === selectedValues.endDate[0] && selectedValues.endDate[0] === '') {
                return
            }

            const label = document.createElement('div')
            label.classList.add('btn-text', 'btn-md', 'border-2', 'btn-sm', 'border-basketball-500', 'border-solid')
            if (value === selectedValues.startDate[0]) {
                label.innerHTML = `from ${value} <a class='text-lg'>&times;</a> `
            } else if (value === selectedValues.endDate[0]) {
                label.innerHTML = `to ${value} <a class='text-lg'>&times;</a> `
            } else {
                label.innerHTML = `${value} <a class='text-lg'>&times;</a> `
            }
            displayDiv.appendChild(label)

            const removeSign = label.querySelector('a')
            removeSign!.addEventListener('click', () => {
                // the lable on the home page gets removed
                label.remove()

                // If the removed label reprensents the start date or end date of the memory, the input field of start date or end date on the filter drawer gets cleared.
                if (value === selectedValues.startDate[0]) {
                    q<HTMLInputElement>('#filter-start-date').value = ''
                }
                if (value === selectedValues.endDate[0]) {
                    q<HTMLInputElement>('#filter-end-date').value = ''
                }

                // The corresponding lable on the filter drawer gets removed
                const labelsOnFilter = document.querySelectorAll('[data-label = "filter-label"')
                labelsOnFilter.forEach(labelOnFilter => {
                    if (labelOnFilter.textContent!.includes(value)) {
                        labelOnFilter.remove()
                    }
                })

                // The selectedValues gets updated and the memories get filtered.
                for (const key in selectedValues) {
                    const index = selectedValues[key as keyof SelectedValue].indexOf(value)
                    if (index === -1) continue
                    selectedValues[key as keyof SelectedValue].splice(index, 1)
                }
                filterMemories(memories, selectedValues)
            })
        })
    }
}
