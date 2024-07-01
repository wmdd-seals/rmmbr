import { it, expect, describe, beforeEach, vi } from 'vitest'
import { authStateGuard } from './auth'
import { PagePath } from '#utils'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

vi.mock('src/api/supabase.ts', () => ({
    supabase: {
        from: (): void => void 0,
        storage: {
            from: (): void => void 0
        },
        auth: {
            onAuthStateChange: (callback: (event: AuthChangeEvent, sesstion: Session | null) => void): void => {
                callback('SIGNED_OUT', null)
            }
        }
    }
}))

describe('auth.ts', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                href: '/memory/index.html',
                pathname: '/memory/index.html'
            }
        })
    })

    it('make sure the window.location.href is changed if the user is not signed in', () => {
        authStateGuard()
        expect(window.location.href).toEqual(PagePath.SignIn)
    })
})
