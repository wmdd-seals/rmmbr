const prefix = import.meta.env.VITE_APP_URL_PREFIX

export const PagePath = {
    Home: prefix ? `/${prefix}/` : '/',
    SignIn: `${prefix ? `/${prefix}` : ''}/sign-in/index.html`,
    SignUp: `${prefix ? `/${prefix}` : ''}/sign-up/index.html`,
    Memory: `${prefix ? `/${prefix}` : ''}/memory/index.html`
}

export function prefixPath(path: string): string {
    return prefix ? `/${prefix}${path}` : path
}
