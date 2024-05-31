import { describe, expect, it } from 'vitest'
import { auth, firebaseApp, firestore } from './firebase'

describe('firbase.ts', () => {
    it('test it if the initialized firebase objects have truthy value', () => {
        expect(auth).toBeTruthy()
        expect(firestore).toBeTruthy()
        expect(firebaseApp).toBeTruthy()
    })
})
