import { prefixPath } from '#utils'

window.addEventListener('online', () => {
    window.location.href = prefixPath('/')
})
