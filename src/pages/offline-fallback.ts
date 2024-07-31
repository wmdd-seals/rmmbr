const prefix = import.meta.env.VITE_APP_URL_PREFIX

function prefixPath(path: string): string {
    return prefix ? `/${prefix}${path}` : path
}

window.addEventListener('online', () => {
    window.location.href = prefixPath('/')
})
