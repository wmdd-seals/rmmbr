import { it, expect, describe } from 'vitest'
import { getExtensionName } from './get-extension-name'

describe('get-extension-name.ts', () => {
    it('ensures throw string "png"', () => {
        const varOne = getExtensionName('samplefdajffjhfaf.png')
        const varTwo = getExtensionName('sample/sapler/fadfjj/fadf.png')
        const varThree = getExtensionName('sample-sample/fasjlafk-fadjf/sample.png')
        const varFour = getExtensionName('.png')
        const varFive = getExtensionName('./testsample.tste.tet.tet.png')

        expect(varOne).toBe('png')
        expect(varThree).toBe('png')
        expect(varTwo).toBe('png')
        expect(varFour).toBe('png')
        expect(varFive).toBe('png')
    })
})
