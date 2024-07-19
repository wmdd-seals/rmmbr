import { it, expect, describe } from 'vitest'
import { dateConverterForDb } from '../date-converter-for-db'

describe('date-converter-for-db.ts', () => {
    it('ensures the string "2024-01-01"', () => {
        const dateStringA = '2024/01/01 10:00:00'
        const dateStringB = '2024-01-01'
        const dateStringC = '2024, 01, 01, 10:00:00'
        expect(dateConverterForDb(dateStringA)).toBe('2024-01-01')
        expect(dateConverterForDb(dateStringB)).toBe('2024-01-01')
        expect(dateConverterForDb(dateStringC)).toBe('2024-01-01')
    })
})
