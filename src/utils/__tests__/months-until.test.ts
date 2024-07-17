import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { monthsUntil } from '../months-until'
describe('monthsUntil', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    it('should return the correct number of hours until a date in the future', () => {
        const dstDate = 'May 17, 2024, 04:00'
        const expectedMonths = 2
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(monthsUntil(dstDate)).toBe(expectedMonths)
    })
    it('should return 0 if the target date is current', () => {
        const date = new Date()
        vi.setSystemTime(date)
        expect(monthsUntil(new Date().toISOString())).toBe(0)
    })
    it('should return 0 if the target date is past', () => {
        const dstDate = '1800-01-01'
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(monthsUntil(dstDate) < 0).toBe(true)
    })
})
