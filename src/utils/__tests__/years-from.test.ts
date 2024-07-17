import { describe, it, expect } from 'vitest'
import { yearsFrom } from '../years-from'

describe('yearsFrom', () => {
    it('should return the correct number of years from a date in the past', () => {
        const date = '2000-01-01'
        const years = yearsFrom(date)
        const expectedYears = new Date().getFullYear() - 2000
        expect(years).toBe(expectedYears)
    })

    it('should return 0 for the current date', () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const years = yearsFrom(currentDate)
        expect(years).toBe(0)
    })

    it('should return 0 for a date in the future', () => {
        const futureDate = '3000-01-01'
        const years = yearsFrom(futureDate)
        expect(years).toBe(0)
    })
})
