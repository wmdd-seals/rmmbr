import { it, expect, describe, beforeEach, vi } from 'vitest'
import { redirectIfSignedIn } from './redirectIfSignedIn'
import { Path } from './path'

vi.mock('src/api/supabase', () => ({
    supabase: {
        auth: {
            getUser: (): Promise<unknown> =>
                new Promise(resolve =>
                    resolve({
                        data: {
                            user: 'sample'
                        }
                    })
                )
        }
    }
}))

describe('redirectIfSignedIn.ts', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                href: '/signe-up/index.html',
                pathname: '/signe-up/index.html'
            }
        })
    })

    it('make sure the url changes if user is signed in ', async () => {
        await redirectIfSignedIn()
        expect(window.location.href).toEqual(Path.home)
    })
})
