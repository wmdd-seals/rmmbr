import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { daysUntil } from '../days-until'
describe('hoursUntil', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    it('should return the correct number of hours until a date in the future', () => {
        const dstDate = 'March 17, 2024, 04:00'
        const expectedDays = 2
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(daysUntil(dstDate)).toBe(expectedDays)
    })
    it('should return 0 if the target date is current', () => {
        const date = new Date()
        vi.setSystemTime(date)
        expect(daysUntil(new Date().toISOString())).toBe(0)
    })
    it('should return 0 if the target date is past', () => {
        const dstDate = '1800-01-01'
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(daysUntil(dstDate)).toBe(0)
    })
})
