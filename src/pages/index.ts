const section1 = document.getElementById('home')!
const section2 = document.getElementById('timeline')!
const section3 = document.getElementById('memory')!
const allSections = [section1, section2, section3]

let currentSection: HTMLElement | null
let previousSection: HTMLElement | null

function changeTab(event?: HashChangeEvent): void {
    const currentPageId = location.hash ? location.hash : '#home'
    let previousPageId = '#home'
    if (event && event.oldURL.includes('#')) {
        previousPageId = event.oldURL.substring(event.oldURL.indexOf('#'))
    }

    for (const section of allSections) {
        if (currentPageId === '#' + section.id) {
            currentSection = section
        }
        if (previousPageId === '#' + section.id) {
            previousSection = section
        }
    }

    currentSection!.classList.toggle('hidden')
    previousSection!.classList.toggle('hidden')
}

changeTab()
window.addEventListener('hashchange', e => changeTab(e))
