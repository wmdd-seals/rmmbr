import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { weeksUntil } from '../weeks-until'
describe('weeksUntil', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    it('should return the correct number of hours until a date in the future', () => {
        const dstDate = 'March 24, 2024, 04:00'
        const expectedWeeks = 1
        const date = new Date('March 17, 2024, 04:00')
        vi.setSystemTime(date)
        expect(weeksUntil(dstDate)).toBe(expectedWeeks)
    })
    it('should return 0 if the target date is current', () => {
        const date = new Date()
        vi.setSystemTime(date)
        expect(weeksUntil(new Date().toISOString())).toBe(0)
    })
    it('should return negative number if the target date is past', () => {
        const dstDate = '1800-01-01'
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(weeksUntil(dstDate)).toBe(0)
    })
})
