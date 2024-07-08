import { it, expect, describe } from 'vitest'
import { getExtensionName } from './get-extension-name'

describe('get-extension-name.ts', () => {
    it('ensures throw string "png"', () => {
        const varOne = getExtensionName('samplesamplesamplesample.png')
        const varTwo = getExtensionName('sample/sample/aaabbbbcccc/aaaaa.png')
        const varThree = getExtensionName('sample-sample/aaaaa-bbbbbb/sample.png')
        const varFour = getExtensionName('.png')
        const varFive = getExtensionName('./testsample.test.test.test.png')

        expect(varOne).toBe('png')
        expect(varThree).toBe('png')
        expect(varTwo).toBe('png')
        expect(varFour).toBe('png')
        expect(varFive).toBe('png')
    })
})
