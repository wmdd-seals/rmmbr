import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { daysFrom } from '../days-from'

describe('daysFrom', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return the correct number of days from a date in the past', () => {
        const date = new Date(2000, 0, 1, 13, 30)
        vi.setSystemTime(new Date(2000, 0, 19, 11, 30))
        const days = daysFrom(date.toString())
        expect(days).toBe(17)
    })

    it('it should round dates correctly depending on time', () => {
        const date = new Date(2000, 0, 1, 13, 30)
        vi.setSystemTime(new Date(2000, 0, 19, 14, 30))
        const days = daysFrom(date.toString())
        expect(days).toBe(18)
    })

    it('should return 0 for the current date', () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const days = daysFrom(currentDate)
        expect(days).toBe(0)
    })

    it('should return 0 for a date in the future', () => {
        const futureDate = '3000-01-01'
        const days = daysFrom(futureDate)
        expect(days).toBe(0)
    })
})
