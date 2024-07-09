import { it, expect, describe } from 'vitest'
import { getExtensionName } from './get-extension-name'

describe('get-extension-name.ts', () => {
    it('ensures to return string "png"', () => {
        const varOne = getExtensionName('samplesamplesamplesample.png')
        const varTwo = getExtensionName('sample-aaaaa.png')
        const varThree = getExtensionName('sample.test.png')

        expect(varOne).toBe('png')
        expect(varThree).toBe('png')
        expect(varTwo).toBe('png')
    })

    it('ensures to return null when ', () => {
        const varNull = getExtensionName('')
        const nameWithoutExtension = getExtensionName('samplesample')

        expect(varNull).toBeNull()
        expect(nameWithoutExtension).toBeNull()
    })
})
