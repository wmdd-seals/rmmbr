import { describe, it, expect } from 'vitest'
import { monthsFrom } from '../months-from'

describe('monthsFrom', () => {
    it('should return the correct number of months from a date in the past', () => {
        const date = '2000-01-01'
        const months = monthsFrom(date)
        const now = new Date()
        const past = new Date(date)
        const expectedMonths = (now.getFullYear() - past.getFullYear()) * 12 + (now.getMonth() - past.getMonth())
        expect(months).toBe(expectedMonths)
    })

    it('should return 0 for the current date', () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const months = monthsFrom(currentDate)
        expect(months).toBe(0)
    })

    it('should return a negative number for a date in the future', () => {
        const futureDate = '3000-01-01'
        const months = monthsFrom(futureDate)
        const now = new Date()
        const future = new Date(futureDate)
        const expectedMonths = (now.getFullYear() - future.getFullYear()) * 12 + (now.getMonth() - future.getMonth())
        expect(months).toBe(expectedMonths)
    })
})
