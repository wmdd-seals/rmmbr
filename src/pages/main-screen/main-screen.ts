const page1 = document.getElementById('home')!
const page2 = document.getElementById('timeline')!
const page3 = document.getElementById('memory')!
const allPages = [page1, page2, page3]

function navigateToPage(): void {
    const pageId = location.hash ? location.hash : '#home'
    for (const page of allPages) {
        if (pageId === '#' + page.id) {
            page.classList.remove('hidden')
        } else {
            page.classList.add('hidden')
        }
    }
}
navigateToPage()
window.addEventListener('hashchange', navigateToPage)
