import { describe, expect, it } from 'vitest'
import { firebaseApp } from './firebase'

describe('firbase.ts', () => {
    it('test it if the initialized firebase object has truthy value', () => {
        expect(firebaseApp).toBeTruthy()
    })
})
